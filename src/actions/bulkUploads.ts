"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import * as xlsx from "xlsx";

function makeSlug(title: string) {
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").slice(0, 80);
}

export async function bulkUploadChallenges(categoryId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File;
    const maxSize = parseInt(formData.get("maxSize") as string) || 5; // in MB

    if (!file) {
        throw new Error("No file uploaded");
    }

    if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size exceeds the limit of ${maxSize}MB.`);
    }

    // Read file buffer ArrayBuffer
    const buffer = await file.arrayBuffer();

    try {
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = xlsx.utils.sheet_to_json(worksheet) as any[];

        if (!data || data.length === 0) {
            throw new Error("Excel file is empty or invalid format.");
        }

        // Keep track of counts for order insertion
        let count = await prisma.challenge.count({ where: { categoryId } });

        for (const row of data) {
            const title = row.Title || `Challenge ${count + 1}`;
            const description = row.Description || "No description provided.";
            const type = row["Challenge Type"] || "CODING";
            const questionType = row["Question Type"] || "CODING";
            const difficultyStars = parseInt(row.Difficulty) || 1;
            const language = row.Language || "JavaScript";
            const starterCode = row["Starter Code"] || null;
            const solution = row.Solution || null;
            const hint = row.Hint || null;
            const correctAnswer = row["Correct Answer"] || null;

            const slug = makeSlug(title);

            const challenge = await prisma.challenge.create({
                data: {
                    categoryId,
                    title,
                    slug: `${slug}-${count}-${Date.now()}`,
                    description,
                    type: type as any,
                    questionType: questionType as any,
                    difficultyStars,
                    language,
                    starterCode,
                    solution,
                    hint,
                    correctAnswer,
                    isPublished: true,
                    orderIndex: count,
                }
            });

            // Handle options
            const options = [];
            if (row["Option A"]) options.push({ text: row["Option A"], isCorrect: row["Is Option A Correct"] === "TRUE" || row["Is Option A Correct"] === true });
            if (row["Option B"]) options.push({ text: row["Option B"], isCorrect: row["Is Option B Correct"] === "TRUE" || row["Is Option B Correct"] === true });
            if (row["Option C"]) options.push({ text: row["Option C"], isCorrect: row["Is Option C Correct"] === "TRUE" || row["Is Option C Correct"] === true });
            if (row["Option D"]) options.push({ text: row["Option D"], isCorrect: row["Is Option D Correct"] === "TRUE" || row["Is Option D Correct"] === true });

            if (options.length > 0) {
                await prisma.challengeOption.createMany({
                    data: options.map((o, i) => ({
                        challengeId: challenge.id,
                        text: String(o.text),
                        isCorrect: !!o.isCorrect,
                        orderIndex: i,
                    }))
                });
            }

            // Test cases
            const testCases = [];
            if (row["Test Input 1"]) testCases.push({ input: String(row["Test Input 1"]), expectedOutput: String(row["Test Output 1"]) });
            if (row["Test Input 2"]) testCases.push({ input: String(row["Test Input 2"]), expectedOutput: String(row["Test Output 2"]) });
            if (row["Test Input 3"]) testCases.push({ input: String(row["Test Input 3"]), expectedOutput: String(row["Test Output 3"]) });

            if (testCases.length > 0) {
                await prisma.challengeTestCase.createMany({
                    data: testCases.map((tc, i) => ({
                        challengeId: challenge.id,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        orderIndex: i,
                    }))
                });
            }

            count++;
        }

        revalidatePath(`/admin/challenges/${categoryId}`);
        revalidatePath("/challenges");

        return { success: true, count: data.length };
    } catch (error: any) {
        throw new Error("Error processing file: " + error.message);
    }
}
