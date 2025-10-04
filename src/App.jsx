import React, { useEffect } from 'react'
import { Navbar, Nav, Button, Carousel, Container, Row, Col, Card, Form } from "react-bootstrap";
import { FiPhone, FiMail } from "react-icons/fi"; // usando react-icons (npm i react-icons)

function App() {
  useEffect(() => {
    // Notify serverless endpoint about a visit (best-effort)
    try {
      fetch('/api/track', { method: 'POST', keepalive: true }).catch(() => {});
    } catch (e) {}
  }, []);
  // HERO: cambia estas imágenes por las tuyas
  const heroSlides = [
    { src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552681415_1152885093439543_1338208200375758118_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=0024fc&_nc_ohc=egW4bY-2fTwQ7kNvwHYH0KT&_nc_oc=AdmtL0YhslKH13JtL7ej8Pxd0nq-CYbjJjgfp9mWJPB5MPbeV4KxUSPCacrAEI8xWPs&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gHYyEftFl3sTcDzwHe6yY6IinUYgz7IyHkDYUX3HCFIUw&oe=6907E1B5",
      title: "Nuestra historia comienza aquí", subtitle: "momentos que inspiran" },
    { src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/553097867_837562595432067_912400492163487993_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=0024fc&_nc_ohc=IFLLkLUxJTkQ7kNvwHdaKXU&_nc_oc=AdlpUXmbOk4M0MDFOpyAC4WjikkEjuI_slFYhJCSGzKHYuxssIT5eodmncroP4KDot8&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gErd_p2dWAeejlkaCRo9CfmhDu5tLMHjyipLwuPvIedYQ&oe=6907D8AA",
      title: "cada paso deja huella", subtitle: "colección de recuerdos" },
    { src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552829486_581172328353481_310474822565517739_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=0024fc&_nc_ohc=3ne1vg_jy2QQ7kNvwHbWbrl&_nc_oc=AdlOXyKWTuoh_m7jqz1VOtaFbPM9LiHFFto--7zNschD2G8lKQjY0r-wBt_TCdqJ6oA&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gHhcKWZkJKndLiQseJ9Wtk-KgVm-ga3YxoMtBqnp0P82Q&oe=6907C02F",
      title: "imágenes que hablan", subtitle: "emociones y movimiento" },
  ];

  // GALERÍA: ahora con imagen + título + descripción
  const galeria = [
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/553895920_1605612954182921_5054021965527723939_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=0024fc&_nc_ohc=D0hSXYjeKu8Q7kNvwEWC5qL&_nc_oc=AdkVuc3Eo4IIUbMuv20HMlQ9t9dBHTJ3W5W4Ug8f7Xip9QlLE7uYDoRrd6MsFxoc_rE&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gHodDkMLJ8sWvbiHM9WIIl0N9vyAHwqZZUa1uCMALIBtw&oe=69068718",
      title: "El universo",
      description: "Marco en el inicio del universo"
    },
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552683150_1461002651675410_6824109258118065765_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=0024fc&_nc_ohc=yXvK1Q0cGT4Q7kNvwG1ALxy&_nc_oc=Adk_ecjrfsMgVtyIpBIZQZNe3DL-nhhlDk6AI71Ggdzf-ABROoVj0_50M3K2pdGlFRA&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gFHIGW3DIjY26UPp6M_7qbZ6aeciUad1-QgFm55B5iY7g&oe=69069489",
      title: "El tratado de paz",
      description: "1912 marco firmando el tratado de paz para finalizar la guerra contra los alemanes"
    },
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552548973_1103070615325160_1219524670175272363_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=0024fc&_nc_ohc=JihdAQvev0cQ7kNvwEF0yAj&_nc_oc=AdlPVzWwY7M4NED1FwRClmfMC7g9wSFiy3ZggNhVibVhLj4osxyBxzFfV5uMIWneLao&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gEI4CPZe4xv05myj1rDjoM5-lirZIBdUmWpx1yPm7PQnQ&oe=6906A782",
      title: "Dias en vietnam",
      description: "Marco defendiendo a calama de los bolivianos invasores"
    },
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552820825_1571393184134269_8656207050257438249_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=0024fc&_nc_ohc=Qn7cj-LndyYQ7kNvwF5X179&_nc_oc=AdlFAAGSJmb5nzjxm6ZZ1NZ1Hdoeg2uVNYAK8gR32wUDGveDqqTC6vy1kgm_qZ9pbf4&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gFcRN-b-6JGfQ4FjFlOD8V__P9qZtN_07K3S7pgDfBu4w&oe=690688D0",
      title: "Marko entrenando",
      description: "Marko fue a entrenar al planeta de sayaman para volverse mas fuerte"
    },
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552693319_1425664605774423_8814793321444410876_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=0024fc&_nc_ohc=MQB9acCyBp4Q7kNvwG9EzUp&_nc_oc=AdlStf1QttxGVF-xp9AvVdETO_-q1IWVSkkJRBBZxyW8WjzpJm5MHFetAH-t2lOtwpg&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gH4GxvILNMFQKRpDaoBKG9KUsLqf9nAjgnkexpoL_raDw&oe=69069AB8",
      title: "Pasos sexuales",
      description: "feñita eres gay?"
    },
    {
      src: "https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552764739_683446890890507_3905083845954479440_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=0024fc&_nc_ohc=DtfDwHsMmXAQ7kNvwHDk8Yh&_nc_oc=Adk0gLrzpOMsQtWzfBSYg2-EXwqrAmuVkv02LtSzFOk5vTg9NkWyYe3qQdmHJRaIxg4&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gFHP6TYnwZ1YEUSZY9-D7i2eHN4TZvn0Ra2axtC93excg&oe=69067465",
      title: "Bien ahi marco",
      description: "Marco consigue una mina con las meas tetas"
    },
  ];

  return (
    <>
      {/* NAV */}
      <Navbar expand="lg" bg="white" className="shadow-sm sticky-top">
        <Container>
          <Navbar.Brand href="#"><strong>Marco</strong></Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="me-3">
              <Nav.Link href="#hero">Inicio</Nav.Link>
              <Nav.Link href="#historia">Historia</Nav.Link>
              <Nav.Link href="#galeria">Galería</Nav.Link>
              <Nav.Link href="#contacto">Contacto</Nav.Link>
            </Nav>
            <Button variant="dark" className="rounded-pill px-4">ver más</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* HERO FULL BLEED */}
      <section id="hero" className="full-bleed">
        <Carousel interval={4000} controls indicators fade>
          {heroSlides.map((s, i) => (
            <Carousel.Item key={i}>
              <div className="hero-slide" style={{ backgroundImage: `url(${s.src})` }}>
                <div className="hero-overlay" />
                <div className="h-100 d-flex flex-column justify-content-center" style={{ padding: 24 }}>
                  <div className="text-white" style={{ maxWidth: 680 }}>
                    <h1 className="display-5 fw-bold mb-2">{s.title}</h1>
                    <p className="lead mb-4">{s.subtitle}</p>
                    <Button variant="light" className="me-2 rounded-pill px-4">ver colección</Button>
                    <Button variant="outline-light" className="rounded-pill px-4">conocer más</Button>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* SECCIÓN 1: HISTORIA */}
      <section id="historia" className="py-5">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <div className="fade-image ratio ratio-16x9 rounded-4 shadow-sm"
                   style={{ backgroundImage: `url('https://scontent.fanf5-1.fna.fbcdn.net/v/t1.15752-9/552222723_1229906029171902_780283075370825726_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=0024fc&_nc_ohc=bmikjPSxmogQ7kNvwEldyxz&_nc_oc=AdmMdhsBbwMVOmlzfavIWHPB2vTKXQ8zDT8yUW1TA-vUF_hJ3K6bp_aw1s89MoJj5W4&_nc_ad=z-m&_nc_cid=1364&_nc_zt=23&_nc_ht=scontent.fanf5-1.fna&oh=03_Q7cD3gEbqSex_9d43pEFWI1ND5LUGeOrARq32yAvcu-mjLiC3A&oe=6907DE1E')` }}
              />
            </Col>
            <Col lg={6}>
              <h2 className="fw-semibold mb-3">la historia de matías huanca ali</h2>
              <p className="text-muted fs-5">
                matías huanca ali nació en calama en un mundo rodeado de delincuencia y carencias donde la violencia parecía ser parte del día a día,
                desde pequeño aprendió a caminar entre calles marcadas por la inseguridad y con pocos espacios para soñar en grande,
                sus únicos amigos eran jordan araya marco hinochota isaias espineta y fernando caballa un grupo que lo acompañó en sus primeros años
                compartiendo risas sencillas en medio de un entorno que parecía no dar tregua
              </p>
              <p className="text-muted">
                aunque las circunstancias lo empujaban a seguir el mismo camino oscuro que muchos en su barrio eligieron,
                matías decidió mirar más allá, descubrió que podía expresarse a través del deporte y el arte,
                encontró en el básquetbol la disciplina para alejarse de los vicios y en la fotografía la forma de contar lo que ocurría en su entorno,
                con cada imagen mostraba no solo la dureza de su realidad sino también la esperanza de que incluso en los lugares más hostiles se puede encontrar belleza
              </p>
              <p className="text-muted">
                esta es la historia de un joven que aprendió a transformar la oscuridad en luz,
                que nunca olvidó a sus amigos y que decidió escribir un destino distinto,
                marcando con su vida el mensaje de que los sueños sí pueden nacer incluso en medio de la adversidad
              </p>
              <Button variant="dark" className="rounded-pill px-4">conocer más</Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 2: GALERÍA */}
      <section id="galeria" className="py-5 bg-light">
        <Container>
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h2 className="fw-semibold m-0">galería destacada</h2>
            <small className="text-muted">explora las imágenes</small>
          </div>
          <Row className="g-4">
            {galeria.map((item, i) => (
              <Col md={4} sm={6} xs={12} key={i}>
                <Card className="border-0 shadow-sm overflow-hidden gallery-card h-100">
                  <img src={item.src} className="gallery-photo" alt={item.title} />
                  <Card.Body>
                    <Card.Title className="mb-1">{item.title}</Card.Title>
                    <Card.Text className="text-muted">{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* SECCIÓN 3: CONTACTO / CTA */}
      <section id="contacto" className="py-5 full-bleed cta">
        <div className="cta-inner">
          <h2 className="fw-semibold mb-3 text-white">¿Quieres llamar al marco?</h2>
          <p className="text-white-50 mb-4">Llama al +56 9 26365123 o envianos un correo</p>
          <div className="d-flex flex-wrap gap-3">
            <Button variant="light" className="rounded-pill px-4">
              <FiPhone size={18} className="me-2" /> llamar ahora
            </Button>
            <Button variant="outline-light" className="rounded-pill px-4">
              <FiMail size={18} className="me-2" /> enviar correo
            </Button>
          </div>
          <div className="mt-4 bg-white rounded-3 shadow-sm p-3" style={{ maxWidth: 520 }}>
            <Form className="d-flex gap-2">
              <Form.Control type="email" placeholder="tu correo" />
              <Button variant="dark">ok</Button>
            </Form>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-4 text-center text-muted">
        <Container>
          © {new Date().getFullYear()} Marco · todos los derechos reservados
          <div className="mt-2">
            <Button variant="link" size="sm" onClick={() => {
              const token = prompt('Introduce el token de descarga');
              if (token) {
                window.open(`/api/download?token=${encodeURIComponent(token)}`, '_blank');
              }
            }}>Descargar logs</Button>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default App;
