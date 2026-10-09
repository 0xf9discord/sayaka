import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
const file=join(import.meta.dir,'..','data','warnings.json');
type Warning={moderator:string;reason:string;at:string};
type Store=Record<string,Warning[]>;
function read():Store { try {return JSON.parse(readFileSync(file,'utf8')) as Store;} catch (e) {if (!existsSync(file)) return {};throw e;} }
export function getWarnings(guild:string,user:string) {return read()[`${guild}:${user}`] ?? [];}
export function addWarning(guild:string,user:string,moderator:string,reason:string) {
  const store=read();const key=`${guild}:${user}`;
  store[key]??=[];store[key].push({moderator,reason,at:new Date().toISOString()});
  mkdirSync(dirname(file),{recursive:true});const temp=`${file}.tmp`;
  writeFileSync(temp,JSON.stringify(store,null,2),{mode:0o600});renameSync(temp,file);
  return store[key].length;
}
