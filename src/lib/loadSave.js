import { decodeCardRules } from './cardRules.js';
import { parseSaveFile } from './saveFile.js';
import { buildSaveModel } from './saveModel.js';
import { ERRORS, MAX_SAVE_FILE_BYTES } from '../constants.js';

export async function loadSave(file) {
  if (file.size > MAX_SAVE_FILE_BYTES) return { fileName: file.name, error: ERRORS.tooLarge };

  try {
    const save = parseSaveFile(await file.arrayBuffer());
    return {
      fileName: file.name,
      savemap: save.savemap,
      model: buildSaveModel(save.savemap),
      cardRules: decodeCardRules(save),
    };
  } catch (error) {
    const isOwnMessage = Object.values(ERRORS).includes(error.message);
    // Not one of ours means a bug here, not a bad file.
    if (!isOwnMessage) console.error(`Reading ${file.name} failed:`, error);
    return { fileName: file.name, error: isOwnMessage ? error.message : ERRORS.unreadable };
  }
}
