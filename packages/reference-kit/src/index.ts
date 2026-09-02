import { z } from "zod";

const nonEmptyStrings = z.array(z.string().min(1)).min(1);

export const acceptanceCriterionSchema = z.object({
  id: z.string().regex(/^AC-\d{2}$/),
  given: z.string().min(1),
  when: z.string().min(1),
  then: nonEmptyStrings,
});

export const featureSpecSchema = z.object({
  id: z.string().regex(/^[A-Z]+-\d{3}$/),
  title: z.string().min(1),
  status: z.enum(["discovery", "ready", "building", "verified", "released"]),
  story: z.object({
    actor: z.string().min(1),
    need: z.string().min(1),
    outcome: z.string().min(1),
  }),
  scope: nonEmptyStrings,
  nonGoals: nonEmptyStrings,
  references: nonEmptyStrings,
  dataRequirements: nonEmptyStrings,
  permissions: nonEmptyStrings,
  mcpImpact: z.object({
    resources: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  acceptanceCriteria: z.array(acceptanceCriterionSchema).min(1),
  fixtures: nonEmptyStrings,
  verification: nonEmptyStrings,
});

export type FeatureSpec = z.infer<typeof featureSpecSchema>;

export function parseFeatureSpec(value: unknown): FeatureSpec {
  return featureSpecSchema.parse(value);
}

