import { MulmoStudioContext } from "../types/index.js";
import { GraphAILogger } from "graphai";
import { google } from "googleapis";
import { createReadStream } from "fs";

export const youtube = async (context: MulmoStudioContext): Promise<MulmoStudioContext> => {
  try {
    GraphAILogger.info("🎬 Uploading video to YouTube...");

    const oauth2Client = new google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, "http://localhost:8000/oauth2callback");

    // Set refresh token if available
    if (process.env.YOUTUBE_REFRESH_TOKEN) {
      oauth2Client.setCredentials({
        refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      });

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        GraphAILogger.info("✅ アクセストークンの更新が完了しました");
      } catch (error) {
        GraphAILogger.error("❌ アクセストークンの更新に失敗しました:", error);
        process.exit(1);
      }
    } else {
      GraphAILogger.info("❌ No refresh token found in environment variables.");
      GraphAILogger.info("📝 Please run the authentication flow first to get a refresh token.");
      process.exit(1);
    }
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    GraphAILogger.info("🎬 youtubeインスタンス化");

    const title = context.studio.script.references![0].title || `最新暗号資産ニュース - ${new Date().toISOString()}`;
    const description = context.studio.script.summary || "最新の暗号資産ニュースをお届けします。";
    const tags = [
      "暗号資産",
      "仮想通貨",
      "ニュース",
      "crypto",
      "cryptocurrency",
      "blockchain",
      "bitcoin",
      "ethereum",
      "crypto news",
      "crypto update",
      "digital currency",
      "crypto market",
      "crypto analysis",
      "crypto trading",
    ];
    const privacy = "private";
    const categoryId = "27";

    const requestBody = {
      snippet: {
        title,
        description,
        tags,
        categoryId,
        defaultLanguage: "ja",
        defaultAudioLanguage: "ja",
      },
      status: {
        privacyStatus: privacy,
      },
    };

    const media = {
      body: createReadStream(context.fileDirs.movieFilePath),
    };

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody,
      media,
    });

    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    GraphAILogger.info("✅ Video uploaded successfully!");
    GraphAILogger.info(`📺 Video URL: ${videoUrl}`);
    GraphAILogger.info(`🆔 Video ID: ${videoId}`);
  } catch (error) {
    GraphAILogger.info("❌ Failed to upload video to YouTube:", error);
    process.exit(1);
  }

  return context;
};
