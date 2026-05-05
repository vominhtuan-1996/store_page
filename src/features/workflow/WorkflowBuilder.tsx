import { ToolHeader } from '../../components/ui/HubButton';

interface WorkflowBuilderProps {
  onBack: () => void;
  workflowId: string;
  workflowName: string;
}

export const WorkflowBuilder = ({ onBack, workflowName }: WorkflowBuilderProps) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ToolHeader
        title={workflowName}
        subtitle="Workflow Builder"
        accent="#89AACC"
        onBack={onBack}
      />
      <div className="flex flex-1 items-center justify-center px-10 py-8">
        <div className="text-center">
          <div className="mb-4 text-4xl">⬡</div>
          <p className="text-sm text-slate-500">Workflow editor coming soon</p>
        </div>
      </div>
    </div>
  );
};
