"use client";

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import with ssr: false ensures document is defined
const ReactQuill = dynamic(async () => {
    const { default: RQ } = await import("react-quill-new");
    // Forward wrapper ref specifically for the react-quill package behavior
    const RQWrapper = ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
    RQWrapper.displayName = "RQWrapper";
    return RQWrapper;
}, { ssr: false });

export default function QuillEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const quillRef = useRef<any>(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
                const data = await res.json();

                if (data.success) {
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection() || { index: quill.getLength() };
                        quill.insertEmbed(range.index, 'image', data.url);
                        quill.setSelection(range.index + 1);
                    }
                } else {
                    alert('Lỗi upload ảnh: ' + data.message);
                }
            } catch (err) {
                alert('Lỗi kết nối khi chèn ảnh!');
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'align': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    return (
        <div className="bg-white rounded [&_.ql-container]:min-h-[400px] [&_.ql-container]:text-base [&_.ql-editor]:min-h-[400px] mb-4">
            <ReactQuill 
                forwardedRef={quillRef}
                theme="snow" 
                value={value} 
                onChange={onChange} 
                modules={modules}
            />
        </div>
    );
}
