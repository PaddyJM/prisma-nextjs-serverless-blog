import { ReactNode } from "react";
import Header from "./Header";
import PropTypes from "prop-types";

type Props = {
  children: ReactNode | ReactNode[];
};

const Layout: React.FC<Props> = (props) => (
  <div>
    <Header />
    <div className="layout">{props.children}</div>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
