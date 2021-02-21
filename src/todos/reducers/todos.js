import {
  LOAD_TODO_RES,
  ADD_TODO,ADD_TODO_RES,
  DELETE_TODO,DELETE_TODO_RES,
  EDIT_TODO,EDIT_TODO_RES,
  COMPLETE_TODO_RES,
  CLEAR_COMPLETED,
  CLEAR_COMPLETED_RES,
} from '../constants/ActionTypes';
// let todos=localStorage.getItem("todos");
const initialState = [];
export default function todos(state = initialState, action) {
  
  switch (action.type) {
    case LOAD_TODO_RES:
      console.log(action);
      let todos2 = action.res.data;
      return todos2;
    case ADD_TODO_RES:
      console.log(action);
      state = [
        action.res.data,
        ...state,
      ];
      return state;
    case DELETE_TODO_RES:
      console.log(action);
      state = state.filter(todo => todo.id !== action.res.data.id);
      return state;      
    case EDIT_TODO_RES:
      console.log(state,action);
      state = state.map((todo) =>{
          if(todo.id === action.res.data.id)
            { return action.res.data }
          else
            {return  todo}
        }
      );
      console.log(state);
      return state;

    case COMPLETE_TODO_RES:
      console.log(action);
      state = state.map(todo =>
        todo.id === action.res.data.id ? { ...todo, completed:action.res.data.completed } : todo
      );
      console.log(state);
      return state;
    case CLEAR_COMPLETED_RES:
      console.log(action)
      state = state.filter(todo => todo.completed === false);
      localStorage.setItem('todos', JSON.stringify(state));
      return state;

    default:
      return state;
  }
}
