import Link from 'next/link'
import { useContext } from 'react'
import { DataContext } from '../../store/GlobalState'
import { addToCart } from '../../store/Actions'

const ProductItem = ({product, handleCheck}) => {
    const { state, dispatch } = useContext(DataContext)
    const { cart, auth } = state

    const userLink = () => {
        return(
            <>
                <Link href={`product/${product._id}`}>
                    <a className="btn btn-info"
                    style={{marginRight: '5px', flex: 1}}>Ver</a>
                </Link>
                <button className="btn btn-success"
                style={{marginLeft: '5px', flex: 1}}
                disabled={product.inStock === 0 ? true : false} 
                onClick={() => dispatch(addToCart(product, cart))} >
                    Añadir al carrito {product.price}
                </button>
            </>
        )
    }

    const adminLink = () => {
        return(
            <>
                <Link href={`create/${product._id}`}>
                    <a className="btn btn-info"
                    style={{marginRight: '5px', flex: 1}}>Editar</a>
                </Link>
                <button className="btn btn-danger"
                style={{marginLeft: '5px', flex: 1}}
                data-toggle="modal" data-target="#exampleModal"
                onClick={() => dispatch({
                    type: 'ADD_MODAL',
                    payload: [{ 
                        data: '', id: product._id, 
                        title: product.title, type: 'DELETE_PRODUCT' 
                    }]
                })} >
                    Eliminar
                </button>
            </>
        )
    }

    return(
        <div className="card" style={{ width: '18rem' }}>
            {
                auth.user && auth.user.role === 'admin' &&
                <input type="checkbox" checked={product.checked}
                className="position-absolute"
                style={{height: '20px', width: '20px'}}
                onChange={() => handleCheck(product._id)} />
            }
            <img className="card-img-top" src={product.images[0].url} alt={product.images[0].url} />
            <div className="card-body">
                <h5 className="card-title text-capitalize" title={product.title}>
                    {product.title}
                </h5>

                <p className="card-text" title={product.description}>
                    {product.description}
                </p>

                <div className="row justify-content-between mx-0">
                    <h6 hidden className="text-danger">${product.price}</h6>
                    {
                        product.inStock > 0
                        ? <h6 className="text-danger">En Stock: {product.inStock}</h6>
                        : <h6 className="text-danger">Sin Stock</h6>
                    }
                </div>

                
                    
                <div className="row justify-content-between mx-0">
                    {!auth.user || auth.user.role !== "admin" ? userLink() : adminLink()}
                </div>
            </div>
        </div>
    )
}


export default ProductItem