export const parseArgs = (): { serverUrl: string } => {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: pnpm dev -- [options]

Options:
  --server_url=<url>     Base URL of the UCP server (default: http://localhost:3000)
`);
    process.exit(0);
  }
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq >= 0) {
        parsed[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed[arg.slice(2)] = args[++i];
      }
    }
  }
  return {
    serverUrl: parsed.server_url ?? 'http://localhost:3000',
  };
};
