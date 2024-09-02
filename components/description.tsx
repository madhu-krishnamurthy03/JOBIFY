"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Editor, EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { useMutation } from "convex/react";
import { AlertOctagon } from "lucide-react";
import { toast } from "sonner";

// CSS for Draft.js editor
import "draft-js/dist/Draft.css";
import "./EditorStyles.css"; // Import your custom CSS

interface DescriptionProps {
    gigId: Id<"gigs">;
    initialContent?: string;
    editable: boolean;
    className?: string;
}

export const Description = ({
    gigId,
    initialContent,
    editable,
    className
}: DescriptionProps) => {
    const [editorState, setEditorState] = useState<EditorState>(
        () => EditorState.createEmpty()
    );
    const update = useMutation(api.gig.updateDescription);

    // Initialize the editor state with the provided initialContent
    useEffect(() => {
        if (initialContent) {
            const content = convertFromRaw(JSON.parse(initialContent));
            setEditorState(EditorState.createWithContent(content));
        }
    }, [initialContent]);

    // Handle content changes and update the state
    const handleChange = (newState: EditorState) => {
        setEditorState(newState);
        const contentLength = JSON.stringify(convertToRaw(newState.getCurrentContent())).length;
        if (contentLength < 20000) {
            update({
                id: gigId,
                description: JSON.stringify(convertToRaw(newState.getCurrentContent()))
            });
        } else {
            toast.error('Content is too long. Not saved.', {
                duration: 2000,
                icon: <AlertOctagon />,
            });
        }
    };

    return (
        <div className={`parent-container ${className}`}>
            <div className="editor-container">
                <Editor
                    editorState={editorState}
                    onChange={handleChange}
                    readOnly={!editable}
                />
            </div>
        </div>
    );
};
