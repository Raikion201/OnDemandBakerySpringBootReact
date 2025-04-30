// Replace this line:
const { users, loading, error } = useAppSelector((state) => state.users);

// With this line:
const { users, loading, error } = useAppSelector((state) => state.user); 
// Note: 'user' not 'users' - must match the property name in the store
