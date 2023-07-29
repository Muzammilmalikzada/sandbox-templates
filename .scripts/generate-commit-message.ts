import * as path from "https://deno.land/std@0.196.0/path/mod.ts";

const targetBranch = Deno.args[0];
const currentBranch = Deno.args[1];

const cmd = new Deno.Command("git", {
  args: [
    "diff",
    "--dirstat=files",
    "--no-commit-id",
    "--name-only",
    "--diff-filter=d",
    `${targetBranch}..${currentBranch}`,
  ],
});

const output = (await cmd.output()).stdout;

console.log("Git output: " + output);

const directories = new Set(
  new TextDecoder()
    .decode(output)
    .split("\n")
    .map((line) => line.substring(0, line.lastIndexOf("/"))),
);

let MESSAGE_TEMPLATE =
  `This is a helpful bot that generates a list of changed templates!

## New Sandboxes

`;

for (let dir of directories) {
  if (
    dir.startsWith(".") || dir.split("/").length > 2 || dir.trim().length === 0
  ) {
    continue;
  }
  const url = generateUrl(dir, currentBranch);
  MESSAGE_TEMPLATE += `- [${dir}](${url})\n`;
}

function generateUrl(exampleName: string, branch: string) {
  return `https://codesandbox.io/s/github/codesandbox/sandbox-templates/tree/${branch}/${exampleName}`;
}

console.log(MESSAGE_TEMPLATE);
Deno.writeFileSync(
  path.join(
    path.dirname(path.fromFileUrl(Deno.mainModule)),
    "commit-message.txt",
  ),
  new TextEncoder().encode(MESSAGE_TEMPLATE),
);
