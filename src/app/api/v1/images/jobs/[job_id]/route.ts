import { NextRequest } from "next/server";
import { parseJobId } from "@/lib/api/v1/constants";
import { apiError, apiSuccess } from "@/lib/api/v1/errors";
import { getJobForUser, jobToApiResponse } from "@/lib/api/v1/image-job-service";
import { withApiAuth } from "@/lib/api/v1/middleware";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  return withApiAuth(request, `/api/v1/images/jobs/${job_id}`, async (ctx) => {
    const uuid = parseJobId(job_id);
    if (!uuid) {
      return apiError("job_not_found", "Optimization job not found.", 404);
    }

    const job = await getJobForUser(uuid, ctx.userId);
    if (!job) {
      return apiError("job_not_found", "Optimization job not found.", 404);
    }

    return apiSuccess(jobToApiResponse(job));
  });
}
