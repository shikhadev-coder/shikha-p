export const readAllUsersFormStorage = (key = 'userData') => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
}

export const writeAllUsersToStorage = (data , key = 'userData') => {
    localStorage.setItem(key , JSON.stringify(data))
}

export  const upsertUserIntoStorage = ( userEntry , key = 'userData') => {
    const all = readAllUsersFormStorage(key);
    if(!userEntry?.id) return;
    const i = all.findIndex(u => u.id === userEntry.id);
    if(i !== -1 ){
        all[i] = {...all[i] , ...userEntry};
    } else {
        all.push(userEntry)
    }
    writeAllUsersToStorage(all , key );
    return all;
}