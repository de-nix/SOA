import React, {useEffect, useState} from "react";

import "./index.scss";
import Product from "./model/Product";
import {Box, Typography} from "@mui/material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import {fromFetch} from "rxjs/fetch";

export default function ShoppingCart(props) {
    const API_URL = "http://localhost:3001";
    const [cartInfo, setCartInfo] = useState<string>('');
    const [cartProducts, setCartProducts] = useState<Product[]>([]);

    useEffect(() => {
        handleGetCart()
        handleGetAllProducts()
    }, [cartProducts])

    function handleGetAllProducts() {
        fromFetch(`${API_URL}/products`)
            .subscribe(response => {
                response.json().then(prods => prods.map(prod => prod.id)).then(
                    idProds => cartProducts.map(cartP => removeIfRedundant(!idProds.includes(cartP.id), cartP))
                ).then(
                    redundants => {
                        if (redundants.some(x => x)) {
                            handleGetCart()
                        }
                    }
                );
            });
    }

    function removeIfRedundant(redundant: boolean, product: Product) {
        if (redundant) {
            handleRemoveFromCart(product)
        }
        return redundant
    }

    // ShoppingCart
    function handleGetCart() {
        fetch(`${API_URL}/cart/${props.username}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.jwtToken,
            },
        })
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(cart => {

                handleGetAllProducts()
                setCartProducts(cart.products);
                setCartInfo(`You have ${cart.products.length} products in cart`);
            })
            .catch(error => {
                console.error(error);
                alert("Something went wrong :(");
            });
    }


    function handleRemoveFromCart(product: Product) {
        fetch(`${API_URL}/cart/${props.username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.jwtToken,
            },
            body: JSON.stringify(product),
        })
            .then(response => {
                if (!response.ok) throw response;
                handleGetCart();
                return response.text();
            })
            .catch(error => {
                console.error(error);
                alert("Something went wrong :(");
            });
    }

    const columns: GridColDef[] = [
        {
            field: 'id', headerName: 'ID',
            flex: 1, type: 'number',
            headerAlign: 'center',
        },
        {
            field: 'name',
            headerName: 'Product Name',
            headerAlign: 'center',
            flex: 2,
        },
        {
            field: 'price',
            headerName: 'Price',
            type: 'number',
            headerAlign: 'center',
            flex: 1,
        },
        {
            field: 'deleteProduct',
            headerName: 'Delete Product',
            flex: 2,
            align: 'center',
            headerAlign: 'center',
            renderCell: params =>
                <ClearIcon color={"error"}
                           onClick={() => handleRemoveFromCart(params.row)}/>
        },
    ];

    // Render
    return (
        <Box>
            <Box sx={{height: 500, width: 600}}>
                <DataGrid
                    rows={cartProducts}
                    columns={columns}
                />
            </Box>
            <Typography>{cartInfo}</Typography>
        </Box>
    );
}


