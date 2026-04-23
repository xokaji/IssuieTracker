import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import IssueForm from "../components/issues/IssueForm";
import { useCreateIssue } from "../hooks/useIssues";
import type { IssueFormData } from "../types";

function getApiErrorMessage(err: unknown, fallback: string) {
  if (!err || typeof err !== "object") return fallback;
  const maybe = err as { response?: { data?: { error?: unknown } } };
  const msg = maybe.response?.data?.error;
  return typeof msg === "string" && msg.trim().length > 0 ? msg : fallback;
}

export default function NewIssuePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateIssue();

  const handleSubmit = async (data: IssueFormData) => {
    try {
      const issue = await mutateAsync(data);
      toast.success("Issue created");
      navigate(`/issues/${issue._id}`);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to create issue"));
    }
  };

  return (
    <div className="page-shell mx-auto max-w-6xl">
      <div className="surface overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Issue Details</h2>
          <p className="mt-1 text-sm text-slate-600">
            Use a specific title and include enough context in the description.
          </p>
        </div>
        <IssueForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/issues")}
          isLoading={isPending}
          submitLabel="Create Issue"
        />
      </div>
    </div>
  );
}
