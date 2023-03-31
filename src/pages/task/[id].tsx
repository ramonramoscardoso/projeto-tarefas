import { GetServerSideProps } from "next";
import Head from "next/head";
import styles from "./styles.module.css";

import { db } from "../../services/firebaseConnection";
import { doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { TextArea } from "@/src/components/utils/text-area";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
    item: {
        task: string;
        public: boolean;
        created: string;
        user: string;
        taskId: string;
    },
    allComments: CommentProps[]
}

interface CommentProps {
    id: string;
    comment: string;
    taskId: string;
    user: string;
    name: string;
}

export default function Task({ item, allComments }: TaskProps) {

    const { data: session } = useSession();
    const [input, setInput] = useState('');
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if (input === '') return;

        if (!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            })

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            }

            setComments([...comments, data])
            setInput('')
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteComment(id: string) {
        try {
            const docRef = doc(db, 'comments', id)
            await deleteDoc(docRef)

            const refreshComments = comments.filter( (comment) => comment.id !== id )
            setComments(refreshComments)

            alert('Comentario deletado!')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>
                    Detalhes da tarefa
                </title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.task}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentario</h2>

                <form onSubmit={handleComment}>
                    <TextArea
                        placeholder="Digite o seu comentario"
                        value={input}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { setInput(event.target.value) }}
                    />
                    <button
                        className={styles.button}
                        disabled={!session?.user}
                    >
                        Enviar Comentario
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos comentarios</h2>
                {!comments.length ? (
                    <span>Nenhum comentario foi encontrado...</span>
                ) : (
                    <>
                        {comments.map((item) => (
                            <article key={item.id} className={styles.comment}>
                                <div className={styles.headComment}>
                                    <label className={styles.commentsLabel}>{item.name}</label>
                                    {item.user === session?.user?.email && (
                                        <button className={styles.buttonTrash}>
                                            <FaTrash
                                                size={18}
                                                color='#ea3140'
                                                onClick={() => handleDeleteComment(item.id)}
                                            />
                                        </button>
                                    )}
                                </div>
                                <p>{item.comment}</p>
                            </article>
                        ))}
                    </>
                )}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id)
    const snapshot = await getDoc(docRef)

    const q = query(collection(db, 'comments'), where('taskId', '==', id))
    const snapshotComments = await getDocs(q)

    let allComments: CommentProps[] = []
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })

    if (!snapshot.data()) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    const miliseconds = snapshot.data()?.created.seconds * 1000;

    const task = {
        task: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id
    }

    return {
        props: {
            item: task,
            allComments
        }
    }
}