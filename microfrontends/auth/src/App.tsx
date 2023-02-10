import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import NavigationBar from "./components/NavigationBar";

const App = () => {

    return <div className="mt-10 text-3xl mx-auto max-w-6xl">
        <NavigationBar/>
    </div>
};
ReactDOM.render(<App />, document.getElementById("app"));
