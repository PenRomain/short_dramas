import "articy-js";

declare module "articy-js" {
  interface Settings {
    set_Localization: string;
  }
  interface DialogueFragmentProps {
    StageDirections: string;
    Color: {
      r: number;
      g: number;
      b: number;
    };
    Parent: string;
  }
  interface ScriptNodeProps {
    DisplayName?: string;
  }
}
