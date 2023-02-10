import React, {useEffect, useState} from "react";

import io from 'socket.io-client';
import "./index.scss";
import Product from "./model/Product";
import {Box, Button, IconButton, TextField, Typography} from "@mui/material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ClearIcon from '@mui/icons-material/Clear';
import {fromFetch} from "rxjs/fetch";

export default function Products(props) {
    const API_URL = "http://localhost:3001";

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [cartProductsIds, setCartProductsIds] = useState<number[]>([]);
    const [newProduct, setNewProduct] = useState<Product>(new Product(0, '', 0));
    const [addProductMessage, setAddProductMessage] = useState<string>("");
    const [deleteProductMessage, setDeleteProductMessage] = useState<string>("");
    const socket = io(API_URL, {autoConnect: true});
    const [socketIsConnected, setSocketIsConnected] = useState<boolean>(false);


    useEffect(() => {
        handleGetCartProducts();
        handleGetAllProducts();
        configureWebSocket();
    }, [])

    function handleGetAllProducts() {
        if (!socketIsConnected) {
            socket.connect();
            setSocketIsConnected(true);
        }


        fromFetch(`${API_URL}/products`)
            .subscribe(response => {
                response.json().then(prods => setAllProducts(prods));
            });
    }

    function handleGetCartProducts() {

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
                setCartProductsIds(cart.products.map(prod => prod.id));
            })
            .catch(error => {
                console.error(error);
                alert("Something went wrong :(");
            });
    }

    function handleAddProduct() {
        if (newProduct.name.trim() === '') {
            setAddProductMessage("Please provide a non-empty name and a price.");
            return;
        }

        fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.jwtToken,
            },
            body: JSON.stringify(newProduct),
        })
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(product => {
                setAddProductMessage(`Product added with id: ${product.id}`);
                handleGetAllProducts()
            })
            .catch(error => {
                console.error(error);
                setAddProductMessage("");
                alert("Something went wrong :(");
            });
    }

    function handleDeleteProduct(idD) {
        fetch(`${API_URL}/products/${idD}`, {
            method: 'DELETE',
            headers: {
                'Authorization': props.jwtToken,
            }
        })
            .then(response => {
                if (!response.ok) throw response;
                return response.text()
            })
            .then(productOrNull => {
                if (productOrNull.length) {
                    setDeleteProductMessage(`Product deleted: ${productOrNull}`)
                    handleGetAllProducts()
                } else {
                    setDeleteProductMessage(`Product not found.`)
                }
            })
            .catch(error => {
                console.error(error);
                setAddProductMessage("");
                alert("Something went wrong :(");
            });
    }


    function handleAddToCart(product: Product) {
        fetch(`${API_URL}/cart/${props.username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.jwtToken,
            },
            body: JSON.stringify(product),
        })
            .then(response => {
                if (!response.ok) throw response;
                handleGetCartProducts();
                return response.text();
            })
    }


    // Websocket
    function configureWebSocket() {
        socket.on('connect', () => {
            console.log('[WebSocket] connect');
            socket.emit('message', 'Product store WebSocket is working!');
        });
        socket.on('connected', () => {
            console.log('[WebSocket] connected');
        });
        socket.on('connection', () => {
            console.log('[WebSocket] connection');
        });
        socket.on('connecting', () => {
            console.log('[WebSocket] connecting');
        });
        socket.on('connectEnd', () => {
            console.log('[WebSocket] connectEnd');
        });
        socket.on('disconnect', () => {
            console.log('[WebSocket] disconnect');
        });
        socket.on('disconnected', () => {
            console.log('[WebSocket] disconnected');
        });

        socket.on('write-event', (data: any) => {
            console.log(`[WebSocket] write-event ${data}`);
            handleGetAllProducts();
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
                <ClearIcon color={"error"} onClick={() => handleDeleteProduct(params.row.id)}/>
        },
        {
            field: 'addCart',
            headerName: 'Add To Cart',
            align: 'center',
            headerAlign: 'center',
            flex: 2,
            renderCell: params =>
                <IconButton disabled={cartProductsIds.includes(params.row.id)}
                            onClick={() => handleAddToCart(params.row)}>
                    < AddShoppingCartIcon color={cartProductsIds.includes(params.row.id) ? "disabled" : "success"}/>
                </IconButton>
        },
    ];

    return (
        <Box>
            <Box>
                <TextField
                    sx={{margin: 2}}
                    required
                    size={"small"}
                    id="outlined-required"
                    label="Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
                />
                <TextField
                    sx={{margin: 2}}
                    required
                    type={"number"}
                    id="outlined-required"
                    label="Price"
                    size={"small"}
                    aria-valuemin={1}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({...prev, price: Number(e.target.value)}))}
                />
                <Button size="small" sx={{marginTop: 2}} color="primary" onClick={handleAddProduct}>Add product</Button>
            </Box>
            <Box sx={{height: 500, width: 600}}>
                <DataGrid
                    rows={allProducts}
                    columns={columns}
                />
            </Box>

            <Typography>{addProductMessage}</Typography>
            <Typography>{deleteProductMessage}</Typography>
        </Box>
    );
}


