import Products from "./Products";
import React from "react";
import ReactDOM from "react-dom";

const App = () => {
    return (
        <div className="mt-10 text-3xl mx-auto max-w-6xl">
            <Products/>
        </div>
    );
};

ReactDOM.render(
    <App/>,
    document.getElementById("app")
);
