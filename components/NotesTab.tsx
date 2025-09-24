import VideoNotes from "@/components/VideoNotes";
import React from "react";

interface NotesTabProps {
    videoId: string;
    currentTime: number;
    onBeginInputFocus: () => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
    videoId,
    currentTime,
    onBeginInputFocus,
}) => {
    return (
        <VideoNotes
            videoId={videoId}
            currentVideoTime={currentTime}
            onBeginInputFocus={onBeginInputFocus}
        />
    );
};
