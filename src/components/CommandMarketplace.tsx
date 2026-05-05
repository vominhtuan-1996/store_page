import { ToolHeader } from './ui/HubButton';

interface CommandMarketplaceProps {
  onBack: () => void;
}

const COMMANDS = [
  { name: '/review', desc: 'Review code changes and suggest improvements' },
  { name: '/fix', desc: 'Fix bugs and errors automatically' },
  { name: '/test', desc: 'Generate unit tests for selected code' },
  { name: '/docs', desc: 'Generate documentation for functions' },
  { name: '/refactor', desc: 'Refactor code for readability and performance' },
  { name: '/explain', desc: 'Explain what the selected code does' },
  { name: '/optimize', desc: 'Optimize code for speed and efficiency' },
  { name: '/security', desc: 'Check code for security vulnerabilities' },
];

export const CommandMarketplace = ({ onBack }: CommandMarketplaceProps) => {
  return (
    <div className="flex h-full w-full flex-col">
      <ToolHeader
        title="Slash Commands"
        subtitle="35+ Claude commands for every workflow"
        accent="#34D399"
        onBack={onBack}
      />
      <div className="flex-1 overflow-auto px-10 py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMMANDS.map(cmd => (
            <div
              key={cmd.name}
              className="glass rounded-2xl p-5 transition-all hover:scale-[1.01]"
            >
              <p className="font-mono text-sm font-bold text-emerald-400">{cmd.name}</p>
              <p className="mt-1 text-xs text-slate-500">{cmd.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
