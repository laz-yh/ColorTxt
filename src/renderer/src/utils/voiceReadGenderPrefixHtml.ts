import { icons } from "../icons";

export type VoiceReadGender = "male" | "female";

function svgWithCurrentColor(raw: string): string {
  return raw.replace(/fill="[^"]*"/g, 'fill="currentColor"');
}

export function voiceReadGenderPrefixHtml(
  gender?: VoiceReadGender | null,
): string {
  let icon: string;
  let toneClass: string;
  if (gender === "male") {
    icon = svgWithCurrentColor(icons.genderMale);
    toneClass = "voiceReadGenderPrefix--male";
  } else if (gender === "female") {
    icon = svgWithCurrentColor(icons.genderFemale);
    toneClass = "voiceReadGenderPrefix--female";
  } else {
    icon = svgWithCurrentColor(icons.genderUnknown);
    toneClass = "voiceReadGenderPrefix--unknown";
  }
  return `<span class="voiceReadGenderPrefix ${toneClass}" aria-hidden="true">${icon}</span>`;
}
