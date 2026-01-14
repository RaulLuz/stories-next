"use client";

import React, { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getStorageUsage } from "@/utils/storage";
import { isStoryExpired } from "@/utils/time";

export function StatsDashboard() {
  const { stories } = useLocalStorage();
  const storageUsage = getStorageUsage();

  const stats = useMemo(() => {
    const active = stories.filter((s) => !isStoryExpired(s.expiresAt));
    const expired = stories.length - active.length;
    const images = stories.filter((s) => s.mediaType === "image").length;
    const videos = stories.filter((s) => s.mediaType === "video").length;
    const withText = stories.filter((s) => s.textOverlay).length;

    const usedMB = (storageUsage.used / (1024 * 1024)).toFixed(2);
    const availableMB = (storageUsage.available / (1024 * 1024)).toFixed(2);
    const usagePercent = ((storageUsage.used / (10 * 1024 * 1024)) * 100).toFixed(1);

    return {
      total: stories.length,
      active,
      expired,
      images,
      videos,
      withText,
      usedMB,
      availableMB,
      usagePercent,
    };
  }, [stories, storageUsage]);

  const StatCard = ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-border dark:border-gray-700">
      <p className="text-sm text-gray-text dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-dark dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-text dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-dark dark:text-white">
        Estatísticas
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total de Stories" value={stats.total} />
        <StatCard
          title="Stories Ativos"
          value={stats.active.length}
          subtitle={`${stats.expired} expirados`}
        />
        <StatCard
          title="Imagens"
          value={stats.images}
          subtitle={`${stats.videos} vídeos`}
        />
        <StatCard title="Com Texto" value={stats.withText} />
      </div>

      {/* Storage Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-dark dark:text-white mb-4">
          Uso de Armazenamento
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-text dark:text-gray-400">
            <span>Usado: {stats.usedMB} MB</span>
            <span>Disponível: {stats.availableMB} MB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-instagram-gradient-from via-instagram-gradient-via to-instagram-gradient-to h-full transition-all duration-300"
              style={{ width: `${stats.usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-text dark:text-gray-400 text-right">
            {stats.usagePercent}% utilizado
          </p>
        </div>
      </div>
    </div>
  );
}
