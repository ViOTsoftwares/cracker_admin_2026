"use client";

import React, { useEffect, useState } from "react";
import { InputField } from "@/components/UI/Inputs";
import { validation } from "./validation";
import { isEmpty } from "@/lib/isEmpty";
import { toastMessage } from "@/lib/toast.message";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { Config } from "@/config";
import CardContainer from "@/components/CardContainer";
import {
  OneEmailTemplateApi,
  UpdateEmailTemplateApi,
} from "@/Api/emailTemplate";

const UpdateEmailTemplatePage = () => {
  const [formValues, setFormValues] = useState({
    subject: "",
    identifier: "",
    content: "",
    id: "",
  });
  const params = useParams();
  const id = params.id as string;
  const navigate = useRouter();
  const { subject, identifier, content } = formValues;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
      const response = await UpdateEmailTemplateApi(formValues);

      if (response.success) {
        toastMessage(response.message, "success");
        navigate.back();
      } else {
        setErrors((prev) => ({ ...prev, ...response.errors }));
        toastMessage(response.message, "error");
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const getEmailTemplate = async () => {
    try {
      const response = await OneEmailTemplateApi(id);
      if (response?.success) {
        setFormValues({ ...response?.result, id });
      } else {
        toastMessage(response.message, "error");
      }
    } catch (error) {
      toastMessage("Something went wrong", "error");
    }
  };

  useEffect(() => {
    getEmailTemplate();
  }, []);

  return (
    <CardContainer>
      <button
        type="button"
        onClick={() => navigate.back()}
        className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Email Template
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update reusable email subject and body content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-6">
          <InputField
            label="Subject"
            name="subject"
            value={subject}
            onChange={handleChange}
            error={errors.subject}
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
              height: 950,
              menubar: false,
              plugins: ["lists", "table", "advtable", "code"],
              toolbar:
                "undo redo | blocks | bold italic underline | numlist bullist checklist | table | removeformat | code",
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
              setFormValues((prev) => ({ ...prev, content }))
            }
          />
          {errors.content && (
            <p className="text-xs text-red-500">{errors.content}</p>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </CardContainer>
  );
};

export default UpdateEmailTemplatePage;
