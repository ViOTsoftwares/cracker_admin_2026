"use client";

import React, { useEffect, useState } from "react";
import { FileField, InputField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { Config } from "@/config";
import { CreateCMSApi } from "@/Api/cms";
import CardContainer from "@/components/CardContainer";

const AddPage = () => {
  const [formValues, setFormValues] = useState({
    title: "",
    identifier: "",
    content: "",
  });
  const naviagte = useRouter();
  const { title, identifier, content } = formValues;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validation(formValues);
    if (!isEmpty(err)) {
      setErrors(err);
      return;
    }

    try {
      setLoading(true);
      const response = await CreateCMSApi(formValues);

      if (response.success) {
        toastMessage(response.message, "success");
        naviagte.back();
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContainer>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => naviagte.back()}
        className="
        inline-flex items-center gap-2
        text-sm font-medium
        text-gray-600
        hover:text-gray-900
        transition-colors
        focus:outline-none
        focus:ring-2 focus:ring-gray-300
        rounded-lg
      "
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Project Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage project information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <InputField
            label="Title"
            name="title"
            value={title}
            onChange={handleChange}
            error={errors.title}
          />

          <InputField
            label="Identifier"
            name="identifier"
            value={identifier}
            onChange={handleChange}
            error={errors.identifier}
          />

          <Editor
            apiKey={Config.TINY_KEY}
            init={{
              height: 450,
              menubar: false,
              plugins: ["lists", "table", "advtable"],
              toolbar:
                "undo redo | blocks | bold italic underline | numlist bullist checklist | table | removeformat",
              block_formats:
                "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6",
              table_default_attributes: { border: "1" },
              table_default_styles: {
                width: "100%",
                borderCollapse: "collapse",
              },
              content_style:
                "body { font-family:Arial,Helvetica,sans-serif; font-size:14px; padding:10px; }",
              branding: false,
            }}
            value={content}
            onEditorChange={(content: any) =>
              setFormValues((pre) => ({ ...pre, content: content }))
            }
            //   initialValue="<p>Start writing... add lists, headers, and tables easily!</p>"
          />
          {errors.content && (
            <p className="text-xs text-red-500">{errors.content}</p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Save CMS
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default AddPage;
