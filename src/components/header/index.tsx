import styles from "./styles.module.css";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image";

export function Header() {

    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            Tarefas<span>+</span>
                        </h1>
                    </Link>
                    {session?.user && (
                        <Link href="/dashboard" className={styles.headerButton}>
                            Meu Painel
                        </Link>
                    )}
                </nav>
                {
                    status === "loading" ? (
                        <></>
                    ) : session ? (
                        <button
                            className={styles.headerButton}
                            onClick={() => signOut()}
                        >
                            Olá, {session?.user?.name}
                            <Image
                                className={styles.userImage}
                                alt="Imagem usuario"
                                src={session?.user?.image || ''}
                                priority
                                width={20}
                                height={20}
                            />
                        </button>
                    ) : (
                        <button
                            className={styles.headerButton}
                            onClick={() => signIn("google")}
                        >
                            Acessar
                        </button>
                    )
                }
            </section>
        </header>
    )
}