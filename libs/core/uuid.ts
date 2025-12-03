import { v4 as uuid } from 'uuid';

export { v4 as uuid, v5 as uuidv5, validate as validateUuid } from 'uuid';

export function syntheticUuid() {
  return `00000000-${uuid().slice(9)}`;
}
