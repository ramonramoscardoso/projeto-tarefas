import styles from "./styles.module.css";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { TextArea } from "@/src/components/utils/text-area";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { db } from "../../services/firebaseConnection";
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

interface HomeProps {
    user: {
        email: string;
    }
}

interface TaskProps {
    id: string;
    created: Date;
    public: boolean;
    task: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("")
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        loadTasks()
    }, [user?.email])

    async function loadTasks() {
        const tasksRef = collection(db, "tarefas");
        const q = query(
            tasksRef,
            orderBy("created", "desc"),
            where("user", "==", user?.email),
        )

        onSnapshot(q, (snapshot) => {
            let list = [] as TaskProps[]

            snapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    task: doc.data().tarefa,
                    created: doc.data().created,
                    user: doc.data().user,
                    public: doc.data().public
                })
            })

            setTasks(list)
        })
    }

    function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setInput(event.target.value)
    }

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`)

        alert("URL copiada com sucesso!")
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tarefas", id)

        await deleteDoc(docRef)
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();

        if (input === "") return;

        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            })

            setInput("")
            setPublicTask(false)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            Qual foi sua tarefa?
                        </h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder="Digite qual sua tarefa..."
                                value={input}
                                onChange={handleTextAreaChange}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label>Deixar tarefa pública?</label>
                            </div>
                            <button className={styles.button} type="submit">
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <>
                        <h1>Minhas tarefas</h1>
                        {tasks.map((item) => (
                            <article key={item.id} className={styles.task}>
                                {
                                    item.public && (
                                        <div className={styles.tagContainer}>
                                            <label className={styles.tag}>PUBLICO</label>
                                            <button
                                                className={styles.shareButton}
                                                onClick={() => { handleShare(item.id) }}
                                            >
                                                <FiShare2
                                                    size={18}
                                                    color="#3183ff"
                                                />
                                            </button>
                                        </div>
                                    )
                                }

                                <div className={styles.taskContent}>
                                    {item.public ? (
                                        <Link href={`/task/${item.id}`}>
                                            <p>{item.task}</p>
                                        </Link>
                                    ) : (
                                        <p>{item.task}</p>
                                    )}
                                    <button className={styles.trashButton}>
                                        <FaTrash
                                            size={15}
                                            color="#ea3140"
                                            onClick={() => { handleDeleteTask(item.id) }}
                                        />
                                    </button>
                                </div>
                            </article>
                        )
                        )}
                    </>
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    return (
        {
            props: {
                user: {
                    email: session?.user?.email
                }
            },
        }
    )
}