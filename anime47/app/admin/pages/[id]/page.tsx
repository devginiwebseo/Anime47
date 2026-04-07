import { prisma } from "@/lib/prisma";
import PageEditorForm from "@/components/admin/pages/PageEditorForm";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pageData = await prisma.pages.findUnique({
        where: { id }
    });

    if (!pageData) {
        return notFound();
    }

    return <PageEditorForm pageData={pageData} />;
}
