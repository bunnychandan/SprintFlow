"use client";

import { useState, useEffect, useCallback } from "react";
import { saveBoardPreferences } from "@/services/board";
import type { BoardPreferences, BoardSwimlane, BoardDensity } from "@/types/board";

const DEFAULT_PREFERENCES: BoardPreferences = {
  collapsedColumns: [],
  columnWidths: {},
  swimlane: "none",
  density: "normal",
};

export function useBoardPreferences(projectId: string) {
  const [preferences, setPreferences] = useState<BoardPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/board/preferences`)
      .then((r) => r.ok && r.json())
      .then((data) => {
        if (data) setPreferences(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [projectId]);

  const updatePreferences = useCallback(async (update: Partial<BoardPreferences>) => {
    const merged = { ...preferences, ...update };
    setPreferences(merged);
    try {
      await saveBoardPreferences(projectId, update);
    } catch {
      setPreferences(preferences);
    }
  }, [projectId, preferences]);

  const toggleColumnCollapse = useCallback((status: string) => {
    const collapsed = preferences.collapsedColumns.includes(status)
      ? preferences.collapsedColumns.filter((s) => s !== status)
      : [...preferences.collapsedColumns, status];
    updatePreferences({ collapsedColumns: collapsed });
  }, [preferences, updatePreferences]);

  const setColumnWidth = useCallback((status: string, width: number) => {
    updatePreferences({ columnWidths: { ...preferences.columnWidths, [status]: width } });
  }, [preferences, updatePreferences]);

  const setSwimlane = useCallback((swimlane: BoardSwimlane) => {
    updatePreferences({ swimlane });
  }, [updatePreferences]);

  const setDensity = useCallback((density: BoardDensity) => {
    updatePreferences({ density });
  }, [updatePreferences]);

  return {
    preferences,
    loaded,
    updatePreferences,
    toggleColumnCollapse,
    setColumnWidth,
    setSwimlane,
    setDensity,
  };
}
