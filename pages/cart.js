import Head from "next/head";
import { useContext, useState, useEffect } from "react";
import { DataContext } from "../store/GlobalState";
import CartItem from "../components/CartItem";
import Link from "next/link";
import { getData, postData } from "../utils/fetchData";
import { useRouter } from "next/router";
import Image from "next/image";
import pibeDeFondo from "../public/images/pibeDeFondo.png";

let itemMp;
const Cart = () => {
  const { state, dispatch } = useContext(DataContext);
  const { cart, auth, orders } = state;

  const [total, setTotal] = useState(0);

  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [address, setAddress] = useState("");
  const [cp, setCp] = useState("");
  const [mobile, setMobile] = useState("");
  const [coment, setComent] = useState("");

  const [callback, setCallback] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getTotal = () => {
      const res = cart.reduce((prev, item) => {
        return prev + item.price * item.quantity;
      }, 0);

      setTotal(res);
    };

    getTotal();
  }, [cart]);

  useEffect(() => {
    const cartLocal = JSON.parse(localStorage.getItem("__next__cart01__devat"));
    if (cartLocal && cartLocal.length > 0) {
      let newArr = [];
      const updateCart = async () => {
        for (const item of cartLocal) {
          const res = await getData(`product/${item._id}`);
          const { _id, title, images, price, inStock, sold } = res.product;
          if (inStock > 0) {
            newArr.push({
              _id,
              title,
              images,
              price,
              inStock,
              sold,
              quantity: item.quantity > inStock ? 1 : item.quantity,
            });
          }
        }

        dispatch({ type: "ADD_CART", payload: newArr });
      };

      updateCart();
    }
  }, [callback]);

  const handlePayment = async () => {
    if (!address || !mobile || !coment)
      return dispatch({
        type: "NOTIFY",
        payload: { error: "Por favor, complete los datos de envío." },
      });

    let newCart = [];
    for (const item of cart) {
      const res = await getData(`product/${item._id}`);
      if (res.product.inStock - item.quantity >= 0) {
        newCart.push(item);
      }
      itemMp = {
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      };
      console.log(itemMp);
      let itemMpJson = JSON.stringify(itemMp);
      fetch("http://localhost:8080/checkoutmp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: itemMpJson,
      });
    }

    if (newCart.length < cart.length) {
      setCallback(!callback);
      return dispatch({
        type: "NOTIFY",
        payload: {
          error: "El producto está agotado o la cantidad es insuficiente.",
        },
      });
    }

    dispatch({ type: "NOTIFY", payload: { loading: true } });

    postData(
      "order",
      { provincia, ciudad, address, cp, mobile, coment, cart, total },
      auth.token
    ).then((res) => {
      if (res.err)
        return dispatch({ type: "NOTIFY", payload: { error: res.err } });

      dispatch({ type: "ADD_CART", payload: [] });

      const newOrder = {
        ...res.newOrder,
        user: auth.user,
      };
      dispatch({ type: "ADD_ORDERS", payload: [...orders, newOrder] });
      dispatch({ type: "NOTIFY", payload: { success: res.msg } });
      return router.push(`/order/${res.newOrder._id}`);
    });
  };

  if (cart.length === 0)
    return (
      <Image
        className="img-responsive w-100"
        src={pibeDeFondo}
        alt="not empty"
      />
    );

  return (
    <div className="row mx-auto">
      <Head>
        <title>Carrito</title>
      </Head>

      <div className="col-md-8 text-secondary table-responsive my-3">
        <h2 className="text-uppercase">Carrito de compras</h2>

        <table className="table my-3">
          <tbody>
            {cart.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                dispatch={dispatch}
                cart={cart}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-md-4 my-3 text-right text-uppercase text-secondary">
        <form>
          <h2>Datos de envio</h2>
          <label htmlFor="address">Provincia</label>
          <input
            type="text"
            name="provincia"
            id="provincia"
            className="form-control mb-2"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            placeholder="Por ejemplo Mendoza..."
          />

          <label htmlFor="address">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            id="ciudad"
            className="form-control mb-2"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            placeholder="Por ejemplo Rivadavia..."
          />

          <label htmlFor="address">Dirección</label>
          <input
            type="text"
            name="address"
            id="address"
            className="form-control mb-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ingrese su calle y número"
          />

          <label htmlFor="address">Código postal</label>
          <input
            type="text"
            name="cp"
            id="cp"
            className="form-control mb-2"
            value={cp}
            onChange={(e) => setCp(e.target.value)}
            placeholder="Por ejemplo 5560"
          />

          <label htmlFor="mobile">Numero de telefono con Whatsapp</label>
          <input
            type="text"
            name="mobile"
            id="mobile"
            className="form-control mb-2"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+54 9 xxxxxxxxx"
          />

          <label htmlFor="coment">Comentario</label>
          <input
            type="text"
            name="coment"
            id="coment"
            placeholder="entre que calles, horario de visita, etc."
            className="form-control mb-2"
            value={coment}
            onChange={(e) => setComent(e.target.value)}
          />
        </form>

        <h3>
          Total: <span className="text-danger">${total}</span>
        </h3>

        <Link href="/">
          <a className="btn btn-dark my-2">Seguir comprando</a>
        </Link>

        <Link href={auth.user ? "#!" : "/signin"}>
          <a className="btn btn-dark my-2" onClick={handlePayment}>
            Finalizar compra
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Cart;
