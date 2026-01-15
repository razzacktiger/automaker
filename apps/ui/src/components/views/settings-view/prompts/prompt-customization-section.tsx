import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquareText,
  Bot,
  KanbanSquare,
  Sparkles,
  RotateCcw,
  Info,
  AlertTriangle,
  GitCommitHorizontal,
  Type,
  CheckCircle,
  Lightbulb,
  FileCode,
  FileText,
  Wand2,
  Cog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromptCustomization, CustomPrompt } from '@automaker/types';
import {
  DEFAULT_AUTO_MODE_PROMPTS,
  DEFAULT_AGENT_PROMPTS,
  DEFAULT_BACKLOG_PLAN_PROMPTS,
  DEFAULT_ENHANCEMENT_PROMPTS,
  DEFAULT_COMMIT_MESSAGE_PROMPTS,
  DEFAULT_TITLE_GENERATION_PROMPTS,
  DEFAULT_ISSUE_VALIDATION_PROMPTS,
  DEFAULT_IDEATION_PROMPTS,
  DEFAULT_APP_SPEC_PROMPTS,
  DEFAULT_CONTEXT_DESCRIPTION_PROMPTS,
  DEFAULT_SUGGESTIONS_PROMPTS,
  DEFAULT_TASK_EXECUTION_PROMPTS,
} from '@automaker/prompts';

interface PromptCustomizationSectionProps {
  promptCustomization?: PromptCustomization;
  onPromptCustomizationChange: (customization: PromptCustomization) => void;
}

interface PromptFieldProps {
  label: string;
  description: string;
  defaultValue: string;
  customValue?: CustomPrompt;
  onCustomValueChange: (value: CustomPrompt | undefined) => void;
  critical?: boolean; // Whether this prompt requires strict output format
}

/**
 * Calculate dynamic minimum height based on content length
 * Ensures long prompts have adequate space
 */
function calculateMinHeight(text: string): string {
  const lines = text.split('\n').length;
  const estimatedLines = Math.max(lines, Math.ceil(text.length / 80));

  // Min 120px, scales up for longer content, max 600px
  const minHeight = Math.min(Math.max(120, estimatedLines * 20), 600);
  return `${minHeight}px`;
}

/**
 * PromptField Component
 *
 * Shows a prompt with a toggle to switch between default and custom mode.
 * - Toggle OFF: Shows default prompt in read-only mode, custom value is preserved but not used
 * - Toggle ON: Allows editing, custom value is used instead of default
 *
 * IMPORTANT: Custom value is ALWAYS preserved, even when toggle is OFF.
 * This prevents users from losing their work when temporarily switching to default.
 */
function PromptField({
  label,
  description,
  defaultValue,
  customValue,
  onCustomValueChange,
  critical = false,
}: PromptFieldProps) {
  const isEnabled = customValue?.enabled ?? false;
  const displayValue = isEnabled ? (customValue?.value ?? defaultValue) : defaultValue;
  const minHeight = calculateMinHeight(displayValue);

  const handleToggle = (enabled: boolean) => {
    // When toggling, preserve the existing custom value if it exists,
    // otherwise initialize with the default value.
    const value = customValue?.value ?? defaultValue;
    onCustomValueChange({ value, enabled });
  };

  const handleTextChange = (newValue: string) => {
    // Only allow editing when enabled
    if (isEnabled) {
      onCustomValueChange({ value: newValue, enabled: true });
    }
  };

  return (
    <div className="space-y-2">
      {critical && isEnabled && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-500">Critical Prompt</p>
            <p className="text-xs text-muted-foreground mt-1">
              This prompt requires a specific output format. Changing it incorrectly may break
              functionality. Only modify if you understand the expected structure.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{isEnabled ? 'Custom' : 'Default'}</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-brand-500"
          />
        </div>
      </div>
      <Textarea
        id={label}
        value={displayValue}
        onChange={(e) => handleTextChange(e.target.value)}
        readOnly={!isEnabled}
        style={{ minHeight }}
        className={cn(
          'font-mono text-xs resize-y',
          !isEnabled && 'cursor-not-allowed bg-muted/50 text-muted-foreground'
        )}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * PromptCustomizationSection Component
 *
 * Allows users to customize AI prompts for different parts of the application:
 * - Auto Mode (feature implementation)
 * - Agent Runner (interactive chat)
 * - Backlog Plan (Kanban planning)
 * - Enhancement (feature description improvement)
 */
export function PromptCustomizationSection({
  promptCustomization = {},
  onPromptCustomizationChange,
}: PromptCustomizationSectionProps) {
  const [activeTab, setActiveTab] = useState('auto-mode');

  const updatePrompt = <T extends keyof PromptCustomization>(
    category: T,
    field: keyof NonNullable<PromptCustomization[T]>,
    value: CustomPrompt | undefined
  ) => {
    const updated = {
      ...promptCustomization,
      [category]: {
        ...promptCustomization[category],
        [field]: value,
      },
    };
    onPromptCustomizationChange(updated);
  };

  const resetToDefaults = (category: keyof PromptCustomization) => {
    const updated = {
      ...promptCustomization,
      [category]: {},
    };
    onPromptCustomizationChange(updated);
  };

  const resetAllToDefaults = () => {
    onPromptCustomizationChange({});
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden',
        'border border-border/50',
        'bg-gradient-to-br from-card/90 via-card/70 to-card/80 backdrop-blur-xl',
        'shadow-sm shadow-black/5'
      )}
      data-testid="prompt-customization-section"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-transparent via-accent/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center border border-brand-500/20">
              <MessageSquareText className="w-5 h-5 text-brand-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Prompt Customization
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={resetAllToDefaults} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset All to Defaults
          </Button>
        </div>
        <p className="text-sm text-muted-foreground/80 ml-12">
          Customize AI prompts for Auto Mode, Agent Runner, and other features.
        </p>
      </div>

      {/* Info Banner */}
      <div className="px-6 pt-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">How to Customize Prompts</p>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Toggle the switch to enable custom mode and edit the prompt. When disabled, the
              default built-in prompt is used. You can use the default as a starting point by
              enabling the toggle.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-1 h-auto w-full bg-transparent p-0">
            <TabsTrigger value="auto-mode" className="gap-2">
              <Bot className="w-4 h-4" />
              Auto Mode
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <MessageSquareText className="w-4 h-4" />
              Agent
            </TabsTrigger>
            <TabsTrigger value="backlog-plan" className="gap-2">
              <KanbanSquare className="w-4 h-4" />
              Backlog
            </TabsTrigger>
            <TabsTrigger value="enhancement" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Enhancement
            </TabsTrigger>
            <TabsTrigger value="commit-message" className="gap-2">
              <GitCommitHorizontal className="w-4 h-4" />
              Commit
            </TabsTrigger>
            <TabsTrigger value="title-generation" className="gap-2">
              <Type className="w-4 h-4" />
              Title
            </TabsTrigger>
            <TabsTrigger value="issue-validation" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="ideation" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideation
            </TabsTrigger>
            <TabsTrigger value="app-spec" className="gap-2">
              <FileCode className="w-4 h-4" />
              App Spec
            </TabsTrigger>
            <TabsTrigger value="context-description" className="gap-2">
              <FileText className="w-4 h-4" />
              Context
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="task-execution" className="gap-2">
              <Cog className="w-4 h-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Auto Mode Tab */}
          <TabsContent value="auto-mode" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Auto Mode Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('autoMode')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            {/* Info Banner for Auto Mode */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-foreground font-medium">Planning Mode Markers</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Planning prompts use special markers like{' '}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">[PLAN_GENERATED]</code> and{' '}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">[SPEC_GENERATED]</code> to
                  control the Auto Mode workflow. These markers must be preserved for proper
                  functionality.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Planning: Lite Mode"
                description="Quick planning outline without approval requirement"
                defaultValue={DEFAULT_AUTO_MODE_PROMPTS.planningLite}
                customValue={promptCustomization?.autoMode?.planningLite}
                onCustomValueChange={(value) => updatePrompt('autoMode', 'planningLite', value)}
                critical={true}
              />

              <PromptField
                label="Planning: Lite with Approval"
                description="Planning outline that waits for user approval"
                defaultValue={DEFAULT_AUTO_MODE_PROMPTS.planningLiteWithApproval}
                customValue={promptCustomization?.autoMode?.planningLiteWithApproval}
                onCustomValueChange={(value) =>
                  updatePrompt('autoMode', 'planningLiteWithApproval', value)
                }
                critical={true}
              />

              <PromptField
                label="Planning: Spec Mode"
                description="Detailed specification with task breakdown"
                defaultValue={DEFAULT_AUTO_MODE_PROMPTS.planningSpec}
                customValue={promptCustomization?.autoMode?.planningSpec}
                onCustomValueChange={(value) => updatePrompt('autoMode', 'planningSpec', value)}
                critical={true}
              />

              <PromptField
                label="Planning: Full SDD Mode"
                description="Comprehensive Software Design Document with phased implementation"
                defaultValue={DEFAULT_AUTO_MODE_PROMPTS.planningFull}
                customValue={promptCustomization?.autoMode?.planningFull}
                onCustomValueChange={(value) => updatePrompt('autoMode', 'planningFull', value)}
                critical={true}
              />
            </div>

            {/* Template Prompts Section */}
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Template Prompts</h4>

              {/* Info Banner for Templates */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-foreground font-medium">Template Variables</p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Template prompts use Handlebars syntax for variable substitution. Available
                    variables include{' '}
                    <code className="px-1 py-0.5 rounded bg-muted text-xs">{'{{featureId}}'}</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-muted text-xs">{'{{title}}'}</code>,{' '}
                    <code className="px-1 py-0.5 rounded bg-muted text-xs">
                      {'{{description}}'}
                    </code>
                    , etc.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <PromptField
                  label="Feature Prompt Template"
                  description="Template for building feature implementation prompts. Variables: featureId, title, description, spec, imagePaths, dependencies, verificationInstructions"
                  defaultValue={DEFAULT_AUTO_MODE_PROMPTS.featurePromptTemplate}
                  customValue={promptCustomization?.autoMode?.featurePromptTemplate}
                  onCustomValueChange={(value) =>
                    updatePrompt('autoMode', 'featurePromptTemplate', value)
                  }
                />

                <PromptField
                  label="Follow-up Prompt Template"
                  description="Template for follow-up prompts when resuming work. Variables: featurePrompt, previousContext, followUpInstructions"
                  defaultValue={DEFAULT_AUTO_MODE_PROMPTS.followUpPromptTemplate}
                  customValue={promptCustomization?.autoMode?.followUpPromptTemplate}
                  onCustomValueChange={(value) =>
                    updatePrompt('autoMode', 'followUpPromptTemplate', value)
                  }
                />

                <PromptField
                  label="Continuation Prompt Template"
                  description="Template for continuation prompts. Variables: featurePrompt, previousContext"
                  defaultValue={DEFAULT_AUTO_MODE_PROMPTS.continuationPromptTemplate}
                  customValue={promptCustomization?.autoMode?.continuationPromptTemplate}
                  onCustomValueChange={(value) =>
                    updatePrompt('autoMode', 'continuationPromptTemplate', value)
                  }
                />

                <PromptField
                  label="Pipeline Step Prompt Template"
                  description="Template for pipeline step execution prompts. Variables: stepName, featurePrompt, previousContext, stepInstructions"
                  defaultValue={DEFAULT_AUTO_MODE_PROMPTS.pipelineStepPromptTemplate}
                  customValue={promptCustomization?.autoMode?.pipelineStepPromptTemplate}
                  onCustomValueChange={(value) =>
                    updatePrompt('autoMode', 'pipelineStepPromptTemplate', value)
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Agent Tab */}
          <TabsContent value="agent" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Agent Runner Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('agent')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="System Prompt"
                description="Defines the AI's role and behavior in interactive chat sessions"
                defaultValue={DEFAULT_AGENT_PROMPTS.systemPrompt}
                customValue={promptCustomization?.agent?.systemPrompt}
                onCustomValueChange={(value) => updatePrompt('agent', 'systemPrompt', value)}
              />
            </div>
          </TabsContent>

          {/* Backlog Plan Tab */}
          <TabsContent value="backlog-plan" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Backlog Planning Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('backlogPlan')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            {/* Critical Warning for Backlog Plan */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-foreground font-medium">Warning: Critical Prompts</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Backlog plan prompts require a strict JSON output format. Modifying these prompts
                  incorrectly can break the backlog planning feature and potentially corrupt your
                  feature data. Only customize if you fully understand the expected output
                  structure.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PromptField
                label="System Prompt"
                description="Defines how the AI modifies the feature backlog (Plan button on Kanban board)"
                defaultValue={DEFAULT_BACKLOG_PLAN_PROMPTS.systemPrompt}
                customValue={promptCustomization?.backlogPlan?.systemPrompt}
                onCustomValueChange={(value) => updatePrompt('backlogPlan', 'systemPrompt', value)}
                critical={true}
              />

              <PromptField
                label="User Prompt Template"
                description="Template for the user prompt sent to the AI. Variables: currentFeatures, userRequest"
                defaultValue={DEFAULT_BACKLOG_PLAN_PROMPTS.userPromptTemplate}
                customValue={promptCustomization?.backlogPlan?.userPromptTemplate}
                onCustomValueChange={(value) =>
                  updatePrompt('backlogPlan', 'userPromptTemplate', value)
                }
                critical={true}
              />
            </div>
          </TabsContent>

          {/* Enhancement Tab */}
          <TabsContent value="enhancement" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Enhancement Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('enhancement')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Improve Mode"
                description="Transform vague requests into clear, actionable tasks"
                defaultValue={DEFAULT_ENHANCEMENT_PROMPTS.improveSystemPrompt}
                customValue={promptCustomization?.enhancement?.improveSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('enhancement', 'improveSystemPrompt', value)
                }
              />

              <PromptField
                label="Technical Mode"
                description="Add implementation details and technical specifications"
                defaultValue={DEFAULT_ENHANCEMENT_PROMPTS.technicalSystemPrompt}
                customValue={promptCustomization?.enhancement?.technicalSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('enhancement', 'technicalSystemPrompt', value)
                }
              />

              <PromptField
                label="Simplify Mode"
                description="Make verbose descriptions concise and focused"
                defaultValue={DEFAULT_ENHANCEMENT_PROMPTS.simplifySystemPrompt}
                customValue={promptCustomization?.enhancement?.simplifySystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('enhancement', 'simplifySystemPrompt', value)
                }
              />

              <PromptField
                label="Acceptance Criteria Mode"
                description="Add testable acceptance criteria to descriptions"
                defaultValue={DEFAULT_ENHANCEMENT_PROMPTS.acceptanceSystemPrompt}
                customValue={promptCustomization?.enhancement?.acceptanceSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('enhancement', 'acceptanceSystemPrompt', value)
                }
              />

              <PromptField
                label="User Experience Mode"
                description="Review and enhance from a user experience and design perspective"
                defaultValue={DEFAULT_ENHANCEMENT_PROMPTS.uxReviewerSystemPrompt}
                customValue={promptCustomization?.enhancement?.uxReviewerSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('enhancement', 'uxReviewerSystemPrompt', value)
                }
              />
            </div>
          </TabsContent>

          {/* Commit Message Tab */}
          <TabsContent value="commit-message" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Commit Message Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('commitMessage')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="System Prompt"
                description="Instructions for generating git commit messages from diffs. The AI will receive the git diff and generate a conventional commit message."
                defaultValue={DEFAULT_COMMIT_MESSAGE_PROMPTS.systemPrompt}
                customValue={promptCustomization?.commitMessage?.systemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('commitMessage', 'systemPrompt', value)
                }
              />
            </div>
          </TabsContent>

          {/* Title Generation Tab */}
          <TabsContent value="title-generation" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Title Generation Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('titleGeneration')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="System Prompt"
                description="Instructions for generating concise, descriptive feature titles from descriptions. Used when auto-generating titles for new features."
                defaultValue={DEFAULT_TITLE_GENERATION_PROMPTS.systemPrompt}
                customValue={promptCustomization?.titleGeneration?.systemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('titleGeneration', 'systemPrompt', value)
                }
              />
            </div>
          </TabsContent>

          {/* Issue Validation Tab */}
          <TabsContent value="issue-validation" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Issue Validation Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('issueValidation')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            {/* Critical Warning for Issue Validation */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-foreground font-medium">Warning: Critical Prompt</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  The issue validation prompt guides the AI through a structured validation process
                  and expects specific output format. Modifying this prompt incorrectly may affect
                  validation accuracy.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PromptField
                label="System Prompt"
                description="Instructions for validating GitHub issues against the codebase. Guides the AI to determine if issues are valid, invalid, or need clarification."
                defaultValue={DEFAULT_ISSUE_VALIDATION_PROMPTS.systemPrompt}
                customValue={promptCustomization?.issueValidation?.systemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('issueValidation', 'systemPrompt', value)
                }
                critical={true}
              />
            </div>
          </TabsContent>

          {/* Ideation Tab */}
          <TabsContent value="ideation" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Ideation Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('ideation')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Ideation Chat System Prompt"
                description="System prompt for AI-powered ideation chat conversations. Guides the AI to brainstorm and suggest feature ideas."
                defaultValue={DEFAULT_IDEATION_PROMPTS.ideationSystemPrompt}
                customValue={promptCustomization?.ideation?.ideationSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('ideation', 'ideationSystemPrompt', value)
                }
              />

              <PromptField
                label="Suggestions System Prompt"
                description="System prompt for generating structured feature suggestions. Used when generating batch suggestions from prompts."
                defaultValue={DEFAULT_IDEATION_PROMPTS.suggestionsSystemPrompt}
                customValue={promptCustomization?.ideation?.suggestionsSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('ideation', 'suggestionsSystemPrompt', value)
                }
                critical={true}
              />
            </div>
          </TabsContent>

          {/* App Spec Tab */}
          <TabsContent value="app-spec" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">App Specification Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('appSpec')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Generate Spec System Prompt"
                description="System prompt for generating project specifications from overview"
                defaultValue={DEFAULT_APP_SPEC_PROMPTS.generateSpecSystemPrompt}
                customValue={promptCustomization?.appSpec?.generateSpecSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('appSpec', 'generateSpecSystemPrompt', value)
                }
              />

              <PromptField
                label="Structured Spec Instructions"
                description="Instructions for structured specification output format"
                defaultValue={DEFAULT_APP_SPEC_PROMPTS.structuredSpecInstructions}
                customValue={promptCustomization?.appSpec?.structuredSpecInstructions}
                onCustomValueChange={(value) =>
                  updatePrompt('appSpec', 'structuredSpecInstructions', value)
                }
                critical={true}
              />

              <PromptField
                label="Generate Features from Spec"
                description="Prompt for generating features from a project specification"
                defaultValue={DEFAULT_APP_SPEC_PROMPTS.generateFeaturesFromSpecPrompt}
                customValue={promptCustomization?.appSpec?.generateFeaturesFromSpecPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('appSpec', 'generateFeaturesFromSpecPrompt', value)
                }
                critical={true}
              />
            </div>
          </TabsContent>

          {/* Context Description Tab */}
          <TabsContent value="context-description" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Context Description Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('contextDescription')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Describe File Prompt"
                description="Prompt for generating descriptions of text files added as context"
                defaultValue={DEFAULT_CONTEXT_DESCRIPTION_PROMPTS.describeFilePrompt}
                customValue={promptCustomization?.contextDescription?.describeFilePrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('contextDescription', 'describeFilePrompt', value)
                }
              />

              <PromptField
                label="Describe Image Prompt"
                description="Prompt for generating descriptions of images added as context"
                defaultValue={DEFAULT_CONTEXT_DESCRIPTION_PROMPTS.describeImagePrompt}
                customValue={promptCustomization?.contextDescription?.describeImagePrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('contextDescription', 'describeImagePrompt', value)
                }
              />
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Suggestions Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('suggestions')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Features Suggestion Prompt"
                description="Prompt for analyzing the project and suggesting new features"
                defaultValue={DEFAULT_SUGGESTIONS_PROMPTS.featuresPrompt}
                customValue={promptCustomization?.suggestions?.featuresPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('suggestions', 'featuresPrompt', value)
                }
              />

              <PromptField
                label="Refactoring Suggestion Prompt"
                description="Prompt for identifying refactoring opportunities"
                defaultValue={DEFAULT_SUGGESTIONS_PROMPTS.refactoringPrompt}
                customValue={promptCustomization?.suggestions?.refactoringPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('suggestions', 'refactoringPrompt', value)
                }
              />

              <PromptField
                label="Security Suggestion Prompt"
                description="Prompt for analyzing security vulnerabilities"
                defaultValue={DEFAULT_SUGGESTIONS_PROMPTS.securityPrompt}
                customValue={promptCustomization?.suggestions?.securityPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('suggestions', 'securityPrompt', value)
                }
              />

              <PromptField
                label="Performance Suggestion Prompt"
                description="Prompt for identifying performance issues"
                defaultValue={DEFAULT_SUGGESTIONS_PROMPTS.performancePrompt}
                customValue={promptCustomization?.suggestions?.performancePrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('suggestions', 'performancePrompt', value)
                }
              />

              <PromptField
                label="Base Template"
                description="Base template applied to all suggestion types"
                defaultValue={DEFAULT_SUGGESTIONS_PROMPTS.baseTemplate}
                customValue={promptCustomization?.suggestions?.baseTemplate}
                onCustomValueChange={(value) => updatePrompt('suggestions', 'baseTemplate', value)}
              />
            </div>
          </TabsContent>

          {/* Task Execution Tab */}
          <TabsContent value="task-execution" className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Task Execution Prompts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefaults('taskExecution')}
                className="gap-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Section
              </Button>
            </div>

            {/* Info Banner for Task Execution */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-foreground font-medium">Template Variables</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Task execution prompts use Handlebars syntax for variable substitution. Variables
                  include{' '}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">{'{{taskId}}'}</code>,{' '}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    {'{{taskDescription}}'}
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 rounded bg-muted text-xs">
                    {'{{completedTasks}}'}
                  </code>
                  , etc.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PromptField
                label="Task Prompt Template"
                description="Template for building individual task execution prompts"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.taskPromptTemplate}
                customValue={promptCustomization?.taskExecution?.taskPromptTemplate}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'taskPromptTemplate', value)
                }
              />

              <PromptField
                label="Implementation Instructions"
                description="Instructions appended to feature implementation prompts"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.implementationInstructions}
                customValue={promptCustomization?.taskExecution?.implementationInstructions}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'implementationInstructions', value)
                }
              />

              <PromptField
                label="Playwright Verification Instructions"
                description="Instructions for automated Playwright verification (when enabled)"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.playwrightVerificationInstructions}
                customValue={promptCustomization?.taskExecution?.playwrightVerificationInstructions}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'playwrightVerificationInstructions', value)
                }
              />

              <PromptField
                label="Learning Extraction System Prompt"
                description="System prompt for extracting learnings/ADRs from implementation output"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.learningExtractionSystemPrompt}
                customValue={promptCustomization?.taskExecution?.learningExtractionSystemPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'learningExtractionSystemPrompt', value)
                }
                critical={true}
              />

              <PromptField
                label="Learning Extraction User Template"
                description="User prompt template for learning extraction. Variables: featureTitle, implementationLog"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.learningExtractionUserPromptTemplate}
                customValue={
                  promptCustomization?.taskExecution?.learningExtractionUserPromptTemplate
                }
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'learningExtractionUserPromptTemplate', value)
                }
                critical={true}
              />

              <PromptField
                label="Plan Revision Template"
                description="Template for prompting plan revisions. Variables: planVersion, previousPlan, userFeedback"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.planRevisionTemplate}
                customValue={promptCustomization?.taskExecution?.planRevisionTemplate}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'planRevisionTemplate', value)
                }
              />

              <PromptField
                label="Continuation After Approval Template"
                description="Template for continuation after plan approval. Variables: userFeedback, approvedPlan"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.continuationAfterApprovalTemplate}
                customValue={promptCustomization?.taskExecution?.continuationAfterApprovalTemplate}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'continuationAfterApprovalTemplate', value)
                }
              />

              <PromptField
                label="Resume Feature Template"
                description="Template for resuming interrupted features. Variables: featurePrompt, previousContext"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.resumeFeatureTemplate}
                customValue={promptCustomization?.taskExecution?.resumeFeatureTemplate}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'resumeFeatureTemplate', value)
                }
              />

              <PromptField
                label="Project Analysis Prompt"
                description="Prompt for AI-powered project analysis"
                defaultValue={DEFAULT_TASK_EXECUTION_PROMPTS.projectAnalysisPrompt}
                customValue={promptCustomization?.taskExecution?.projectAnalysisPrompt}
                onCustomValueChange={(value) =>
                  updatePrompt('taskExecution', 'projectAnalysisPrompt', value)
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
