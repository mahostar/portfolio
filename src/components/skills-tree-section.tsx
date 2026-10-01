import { SkillTree } from "@/app/test-dev/skill-tree";
import { techGroups } from "@/content/tech";
import { getTechnologies } from "@/lib/content";
import { TechLogo } from "./tech-logo";

const descriptions: Record<(typeof techGroups)[number], string> = {
  "Hardware and PCB":
    "The physical foundation: designing the boards that connect a system.",
  "Firmware and IoT":
    "Code meets hardware. Microcontrollers, connected devices, and embedded computing.",
  "AI and Agents":
    "Models, computer vision, and the tools behind intelligent applications.",
  "Full-stack": "Interfaces, application logic, and the services that connect them.",
  "3D and Design":
    "From a digital model to a physical part: modelling, CAD, and fabrication.",
};

export function SkillsTreeSection() {
  const technologies = getTechnologies();
  const groups = techGroups
    .map((name, index) => ({
      id: `branch-${index}`,
      name,
      description: descriptions[name],
      tools: technologies
        .filter((technology) => technology.group === name)
        .map((technology) => ({
          id: technology.id,
          name: technology.name,
          logo: <TechLogo id={technology.id} withName />,
        })),
    }))
    .filter((group) => group.tools.length);

  return <SkillTree groups={groups} />;
}
