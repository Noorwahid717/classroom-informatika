import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SubmissionService } from "../services/submission.service";
import { lintHtml } from "../services/lint";
import { runPlaywright } from "../services/playwright";
import { evaluateScore } from "../services/scoring";

@Processor("submission-evaluations")
export class EvaluationProcessor extends WorkerHost {
  constructor(private readonly submissions: SubmissionService) {
    super();
  }

  async process(job: Job<{ submissionId: string }>) {
    const submission = await this.submissions.getSubmission(job.data.submissionId);
    const lintResult = await lintHtml(submission);
    const e2eResult = await runPlaywright(submission);
    const score = evaluateScore(lintResult, e2eResult);
    await this.submissions.completeEvaluation(submission.id, lintResult, score);
    return { score };
  }

  @OnWorkerEvent("failed")
  async onFailed(job: Job, error: Error) {
    await this.submissions.markFailed(job.data.submissionId, error);
  }
}
