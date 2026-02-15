import { google } from "googleapis";

const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

export async function getPlaylistVideos(playlistId: string) {
    try {
        const response = await youtube.playlistItems.list({
            part: ["snippet", "contentDetails"],
            playlistId: playlistId,
            maxResults: 50,
        });

        return response.data.items?.map((item, index) => ({
            title: item.snippet?.title || "",
            description: item.snippet?.description || "",
            thumbnail: item.snippet?.thumbnails?.high?.url || "",
            videoId: item.contentDetails?.videoId || "",
            orderIndex: index,
        })) || [];
    } catch (error) {
        console.error("Error fetching YouTube playlist:", error);
        throw error;
    }
}

export async function getPlaylistMetadata(playlistId: string) {
    try {
        const response = await youtube.playlists.list({
            part: ["snippet"],
            id: [playlistId],
        });

        const playlist = response.data.items?.[0];
        return {
            title: playlist?.snippet?.title || "",
            description: playlist?.snippet?.description || "",
            thumbnail: playlist?.snippet?.thumbnails?.high?.url || "",
        };
    } catch (error) {
        console.error("Error fetching YouTube playlist metadata:", error);
        throw error;
    }
}
