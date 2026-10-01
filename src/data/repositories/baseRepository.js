import { dbGet, dbPut, dbDelete, dbGetAll } from '../localDb.js';
export function createRepository(kind){
  const key=id=>`${kind}:${id}`;
  return {
    async get(id){return dbGet('records',key(id));},
    async save(id,value){const record={id:key(id),kind,value,updatedAt:Date.now()};await dbPut('records',record);return record;},
    async remove(id){return dbDelete('records',key(id));},
    async all(){return (await dbGetAll('records')).filter(item=>item.kind===kind);},
  };
}
