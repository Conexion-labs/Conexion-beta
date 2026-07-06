"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * NSFW Detection categories returned by nsfwjs.
 * We use specific thresholds per class to reduce false positives,
 * as 'Sexy' is notoriously over-sensitive on normal clothing.
 */
const CLASS_THRESHOLDS: Record<string, number> = {
  Porn: 0.80,
  Hentai: 0.80,
  Sexy: 0.95, // Require extremely high confidence for 'Sexy'
};
const ANALYSIS_INTERVAL_MS = 1000; // Check every 1 second to balance accuracy and performance

interface NsfwPrediction {
  className: string;
  probability: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NsfwModel = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MobileNetModel = any;

interface LoadedModels {
  nsfw: NsfwModel;
  mobilenet: MobileNetModel;
}

/**
 * Singleton model loader — loads nsfwjs and mobilenet only once across all hook instances
 * and reuses the same promise/model reference.
 */
let modelPromise: Promise<LoadedModels> | null = null;
let loadedModels: LoadedModels | null = null;

async function loadNsfwModel(): Promise<LoadedModels> {
  if (loadedModels) return loadedModels;
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    try {
      // Dynamically import TensorFlow.js, nsfwjs and mobilenet to keep bundle small
      // and only load on the client side
      const tf = await import("@tensorflow/tfjs");

      // Set the backend to webgl for best performance, fallback to cpu
      try {
        await tf.setBackend("webgl");
        await tf.ready();
      } catch {
        console.warn("WebGL backend not available, falling back to CPU");
        await tf.setBackend("cpu");
        await tf.ready();
      }

      const nsfwjs = await import("nsfwjs");
      const mobilenet = await import("@tensorflow-models/mobilenet");

      const [nsfwModel, mnModel] = await Promise.all([
        nsfwjs.load(),
        mobilenet.load({ version: 2, alpha: 1.0 })
      ]);
      
      loadedModels = { nsfw: nsfwModel, mobilenet: mnModel };
      console.log("[NSFW/Substances] Models loaded successfully");
      return loadedModels;
    } catch (err) {
      console.error("[NSFW/Substances] Failed to load models:", err);
      modelPromise = null; // Allow retry on next call
      throw err;
    }
  })();

  return modelPromise;
}

interface UseNsfwDetectionOptions {
  /** Whether NSFW detection is enabled (e.g. only in video mode) */
  enabled: boolean;
}

interface UseNsfwDetectionReturn {
  /** Whether the NSFW model has finished loading */
  modelLoaded: boolean;
  /** Whether the model is currently loading */
  modelLoading: boolean;
  /** Classify a single video/image element. Returns true if NSFW. */
  classifyElement: (
    element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ) => Promise<boolean>;
}

/**
 * Custom hook for NSFW detection using nsfwjs.
 *
 * Loads the TensorFlow.js model once (singleton) and provides
 * a `classifyElement` function to check any video/image element.
 */
export function useNsfwDetection({
  enabled,
}: UseNsfwDetectionOptions): UseNsfwDetectionReturn {
  const [modelLoaded, setModelLoaded] = useState(!!loadedModels);
  const [modelLoading, setModelLoading] = useState(false);
  const modelRef = useRef<LoadedModels | null>(loadedModels);

  // Load model when enabled
  useEffect(() => {
    if (!enabled) return;
    if (modelRef.current) {
      setModelLoaded(true);
      return;
    }

    let cancelled = false;
    setModelLoading(true);

    loadNsfwModel()
      .then((model) => {
        if (!cancelled) {
          modelRef.current = model;
          setModelLoaded(true);
          setModelLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModelLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const classifyElement = useCallback(
    async (
      element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): Promise<boolean> => {
      const models = modelRef.current;
      if (!models) return false;

      // For video elements, ensure the video has data
      if (element instanceof HTMLVideoElement) {
        if (element.readyState < 2 || element.videoWidth === 0) return false;
      }

      try {
        const [nsfwPreds, mnPreds] = await Promise.all([
          models.nsfw.classify(element),
          models.mobilenet.classify(element)
        ]);
        
        // 1. Check Explicit Content (NSFW)
        const isNsfw = nsfwPreds.some((p: any) => {
          const threshold = CLASS_THRESHOLDS[p.className];
          return threshold !== undefined && p.probability > threshold;
        });
        if (isNsfw) return true;

        // 2. Check Substances / Drugs / Cigarettes
        // Removed broad terms like "match", "lighter", "needle" which trigger false positives on pens/fingers
        const SUBSTANCE_KEYWORDS = ["cigarette", "cigar", "tobacco", "pill", "syringe", "hookah"];
        const isSubstance = mnPreds.some((p: any) => {
          if (p.probability < 0.5) return false; // Increased confidence to 50%
          const classNameStr = p.className.toLowerCase();
          return SUBSTANCE_KEYWORDS.some(kw => classNameStr.includes(kw));
        });

        return isSubstance;
      } catch (err) {
        console.error("[NSFW/Substances] Classification error:", err);
        return false;
      }
    },
    []
  );

  return {
    modelLoaded,
    modelLoading,
    classifyElement,
  };
}

/**
 * Hook that runs periodic NSFW analysis on a video element ref.
 *
 * Returns whether the video is currently flagged as NSFW.
 */
export function useNsfwVideoAnalysis(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  classifyElement: (
    element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ) => Promise<boolean>,
  options: {
    enabled: boolean;
    intervalMs?: number;
  }
): boolean {
  const { enabled, intervalMs = ANALYSIS_INTERVAL_MS } = options;
  const [isNsfw, setIsNsfw] = useState(false);
  const analysisRef = useRef(false); // guard against overlapping classifications

  // Reset NSFW state when analysis is disabled
  useEffect(() => {
    if (!enabled) {
      setIsNsfw(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let consecutiveHits = 0;

    const interval = setInterval(async () => {
      // Skip if a previous classification is still running
      if (analysisRef.current) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }

      analysisRef.current = true;
      try {
        const result = await classifyElement(video);
        
        // Temporal Buffering (Debounce): Require 2 consecutive positive hits to trigger the block
        // This eliminates single-frame glitches/false positives
        if (result) {
          consecutiveHits++;
          if (consecutiveHits >= 2) setIsNsfw(true);
        } else {
          consecutiveHits = 0;
          setIsNsfw(false);
        }
      } finally {
        analysisRef.current = false;
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, intervalMs, classifyElement, videoRef]);

  return isNsfw;
}
