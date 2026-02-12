
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as getPresignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../storage/r2Client.js";

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "offszn-storage";

export const getSignedUrl = async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ error: "Key is required" });
        }

        // Clean key (remove leading slashes if present)
        const cleanKey = key.startsWith('/') ? key.substring(1) : key;

        const command = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: cleanKey,
        });

        // Sign for 1 hour (3600 seconds)
        const url = await getPresignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ downloadUrl: url });
    } catch (error) {
        console.error("Error signing R2 URL:", error);
        res.status(500).json({ error: "Failed to sign URL" });
    }
};
