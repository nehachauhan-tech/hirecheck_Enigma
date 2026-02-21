import { useState, useEffect } from "react";
import { FileText, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ResumeUploadDialogProps {
  token: string;
}

export function ResumeUploadDialog({ token }: ResumeUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && token) {
      setLoading(true);
      fetch("http://localhost:3001/api/stats/resume", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.resumeText) setResumeText(data.resumeText);
        })
        .finally(() => setLoading(false));
    }
  }, [open, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:3001/api/stats/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText }),
      });

      if (res.ok) {
        toast({
          title: "Resume Context Saved",
          description:
            "Your interview questions will now be tailored to your experience.",
        });
        setOpen(false);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume context.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-[#30D8A8]/20 hover:border-[#30D8A8]/50 hover:bg-[#30D8A8]/5"
        >
          <FileText className="w-4 h-4 text-[#30D8A8]" />
          My Resume Context
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#0A0C10] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Personalize Your Interviews</DialogTitle>
          <DialogDescription className="text-white/50">
            Paste your resume text here. The AI will read this to ask you
            relevant questions about your experience, past projects, and tech
            stack.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-white/40">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading your profile...
            </div>
          ) : (
            <Textarea
              placeholder="Paste your resume content here..."
              className="min-h-[300px] bg-black/20 border-white/10 text-white/90 font-mono text-sm resize-none focus:border-[#30D8A8]/50"
              value={resumeText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setResumeText(e.target.value)
              }
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#30D8A8] text-black hover:bg-[#20bd90]"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Context
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
