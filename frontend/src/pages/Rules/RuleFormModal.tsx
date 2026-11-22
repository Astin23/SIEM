import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { DetectionRule } from "@/api/rules";
import { Settings2, Terminal } from "lucide-react";

const ruleSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
  enabled: z.boolean(),
  severity: z.enum(["Critical", "High", "Medium", "Low", "Informational"]),
  priority: z.enum(["P1", "P2", "P3", "P4", "P5"]),
  category: z.string().min(1, "Category is required"),
  conditionsJson: z.string().min(1, "Rule logic is required"),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface RuleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: DetectionRule | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function RuleFormModal({ open, onOpenChange, initialData, onSubmit }: RuleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const form = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
      severity: "Medium",
      priority: "P3",
      category: "",
      conditionsJson: '{\n  "type": "AND",\n  "parameters": []\n}',
    },
  });

  useEffect(() => {
    if (open) {
      setJsonError(null);
      if (initialData) {
        form.reset({
          name: String(initialData.name || ""),
          description: String(initialData.description || ""),
          enabled: Boolean(initialData.enabled),
          severity: initialData.severity as "Critical" | "High" | "Medium" | "Low" | "Informational",
          priority: initialData.priority as "P1" | "P2" | "P3" | "P4" | "P5",
          category: String(initialData.category || ""),
          conditionsJson: initialData.conditions ? JSON.stringify(initialData.conditions, null, 2) : '{\n  "type": "AND",\n  "parameters": []\n}',
        });
      } else {
        form.reset({
          name: "",
          description: "",
          enabled: true,
          severity: "Medium",
          priority: "P3",
          category: "",
          conditionsJson: '{\n  "type": "AND",\n  "parameters": []\n}',
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (values: RuleFormValues) => {
    setJsonError(null);
    let parsedConditions;
    try {
      parsedConditions = JSON.parse(values.conditionsJson);
    } catch (e: unknown) {
      setJsonError(`JSON_PARSE_ERR: ${(e as Error).message}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        description: values.description,
        enabled: values.enabled,
        severity: values.severity,
        priority: values.priority,
        category: values.category,
        conditions: parsedConditions,
      });
      onOpenChange(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setJsonError(err.response?.data?.detail || "SYSTEM_EXCEPTION: Failed to commit rule schema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      
      {/* 
        Brutalist Dialog Shell 
        Stripping all soft rounded edges, background blurs, and default shadows 
      */}
      <DialogContent className="w-full sm:max-w-[750px] max-h-[90vh] overflow-y-auto border border-zinc-800 bg-[#030303] text-[#a1a1aa] p-0 font-['DM_Mono',monospace] shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none">
        
        {/* Terminal Header */}
        <DialogHeader className="p-6 md:p-8 border-b border-zinc-900 bg-[#050505] space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-[#06b6d4] uppercase tracking-[0.2em]">
            <Settings2 className="w-3.5 h-3.5" /> // Policy Configuration Matrix
          </div>
          <DialogTitle className="font-['AeroRetina'] text-2xl md:text-3xl text-[#f4f4f5] tracking-tight uppercase m-0">
            {initialData ? `EDIT_POLICY // [${initialData.name}]` : "NEW_POLICY_DEPLOYMENT"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 tracking-wider">
            {initialData ? "Modify rule syntax, trigger thresholds, and metadata flags." : "Construct a new detection schema for cluster telemetry analysis."}
          </DialogDescription>
        </DialogHeader>

        {/* Form Container */}
        <div className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest">Policy Identifier (Name)</FormLabel>
                      <FormControl>
                        <input placeholder="e.g. Brute Force Attempt" className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors rounded-none placeholder:text-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest">Target Category</FormLabel>
                      <FormControl>
                        <input placeholder="e.g. Authentication" className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors rounded-none placeholder:text-zinc-700" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest">Synopsis / Objective</FormLabel>
                    <FormControl>
                      <input placeholder="A brief description of this policy's core signature..." className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-4 py-2.5 text-xs text-[#f4f4f5] transition-colors rounded-none placeholder:text-zinc-700" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest">Severity Tag</FormLabel>
                      <select 
                        className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-3 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
                        {...field}
                      >
                        <option value="Critical" className="text-[#d83535]">Critical</option>
                        <option value="High" className="text-orange-500">High</option>
                        <option value="Medium" className="text-yellow-500">Medium</option>
                        <option value="Low" className="text-cyan-500">Low</option>
                        <option value="Informational">Informational</option>
                      </select>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest">Score Priority</FormLabel>
                      <select 
                        className="w-full bg-[#050505] border border-zinc-800 focus:border-[#f4f4f5] outline-none px-3 py-2.5 text-xs text-[#f4f4f5] uppercase transition-colors appearance-none cursor-pointer rounded-none"
                        {...field}
                      >
                        <option value="P1">P1 (Highest)</option>
                        <option value="P2">P2</option>
                        <option value="P3">P3</option>
                        <option value="P4">P4</option>
                        <option value="P5">P5 (Lowest)</option>
                      </select>
                      <FormMessage className="text-[10px] text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end pb-1">
                      <div className="flex items-center gap-3 bg-[#050505] border border-zinc-800 px-4 py-2.5 h-[38px] cursor-pointer">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-3.5 w-3.5 rounded-none border-zinc-700 bg-black accent-cyan-400 cursor-pointer"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 text-xs uppercase tracking-wider text-zinc-300 cursor-pointer">Policy Active</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

              </div>

              <FormField
                control={form.control as any}
                name="conditionsJson"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                       <Terminal className="w-3 h-3 text-[#06b6d4]" /> Rule Logic Payload (JSON Syntax)
                    </FormLabel>
                    <FormControl>
                      <textarea 
                        className="w-full bg-[#050505] border border-zinc-800 focus:border-[#06b6d4] outline-none p-4 text-xs font-mono text-cyan-400 resize-y min-h-[220px] rounded-none custom-scrollbar shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-500" />
                    {jsonError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 font-mono">
                        {jsonError}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Brutalist Form Action Bar */}
              <div className="flex justify-end items-center gap-4 pt-6 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isSubmitting}
                  className="text-[10px] tracking-widest uppercase border border-zinc-800 bg-[#050505] px-6 py-3 text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                >
                  [ ABORT ]
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="text-[10px] tracking-widest uppercase border border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#06b6d4] px-8 py-3 hover:bg-[#06b6d4] hover:text-black transition-colors disabled:opacity-30 font-semibold"
                >
                  {isSubmitting ? "COMMIT_PENDING..." : initialData ? "[ UPDATE POLICY ]" : "[ COMMIT NEW POLICY ]"}
                </button>
              </div>

            </form>
          </Form>
        </div>

      </DialogContent>
    </Dialog>
  );
}