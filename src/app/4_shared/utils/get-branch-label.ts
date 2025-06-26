import { DialogueFragment, FlowBranch } from "articy-js";
import { db } from "../model";

export const getBranchLabel = (br: FlowBranch) => {
  const targetId = br.path[br.path.length - 1];
  const obj = db.getObject(targetId, DialogueFragment);
  return obj?.properties.MenuText || `Skip`;
};
