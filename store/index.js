
import userReducer from "./userSlice";

const { configureStore } = require("@reduxjs/toolkit");

const store = configureStore({
    reducer: {
        user:userReducer
    }
})

export default store
