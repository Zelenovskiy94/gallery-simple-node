import React from "react";
import styles from './Header.module.css';

function Header() {
    return (
        <header className={styles.header}>
            <img src="/logo_SS.svg"/>
        </header>
    )
}

export default Header;