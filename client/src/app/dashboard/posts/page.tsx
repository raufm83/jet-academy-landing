"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
  Chip,
  Switch,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdCalendarMonth,
  MdAccessTime,
} from "react-icons/md";
import { toast } from "sonner";
import api from "@/utils/api/axios";
import { Post, PostsResponse } from "@/types/post";
import { getLocalizedPostTags } from "@/utils/helpers/post";
import Link from "next/link";
import { PostType, Role } from "@/types/enums";
import { useSession } from "next-auth/react";

export default function PostsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAuthor = (session?.user as any)?.role === Role.AUTHOR;
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedPostType, setSelectedPostType] = useState<PostType | null>(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filterButtons = isAuthor
    ? [
        { label: "Bütün postlar", value: null },
        { label: "Bloqlar", value: PostType.BLOG },
      ]
    : [
        { label: "Bütün postlar", value: null },
        { label: "Bloqlar", value: PostType.BLOG },
        { label: "Kampaniyalar", value: PostType.OFFERS },
        { label: "Xəbərlər", value: PostType.NEWS },
        { label: "Tədbirlər", value: PostType.EVENT },
      ];

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (isAuthor) {
        const { data } = await api.get<PostsResponse>(
          `/posts/my?page=${page}&limit=${rowsPerPage}&includeUnpublished=true`
        );
        const items = data?.items ?? [];
        const metaTotal = data?.meta?.total ?? 0;
        const lastPage = Math.max(1, Math.ceil(metaTotal / rowsPerPage) || 1);
        setPosts(items);
        setTotalPosts(metaTotal);
        if (page > lastPage) setPage(lastPage);
        return;
      }
      const params = new URLSearchParams({
        page: String(page),
        limit: String(rowsPerPage),
        includeUnpublished: "true",
        includeBlogs: "true",
      });

      if (selectedPostType) {
        params.set("postType", selectedPostType);
      }

      const url = `/posts?${params.toString()}`;
      const { data } = await api.get<PostsResponse>(url);
      const items = data?.items ?? [];
      const metaTotal = data?.meta?.total ?? 0;
      const lastPage = Math.max(1, Math.ceil(metaTotal / rowsPerPage) || 1);
      setPosts(items);
      setTotalPosts(metaTotal);
      if (page > lastPage) setPage(lastPage);
    } catch (error) {
      console.error("Postlar yüklənmədi:", error);
      toast.error("Postlar yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, isAuthor, selectedPostType]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    fetchPosts();
  }, [sessionStatus, fetchPosts]);

  /** Cari səhifə ümumi səhifə sayından böyükdürsə (filter/sil sonrası) düzəlt */
  useEffect(() => {
    const last = Math.max(1, Math.ceil((totalPosts || 0) / rowsPerPage));
    if (page > last) setPage(last);
  }, [totalPosts, rowsPerPage, page]);

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    onDeleteOpen();
  };

  const handleFilterChange = (postType: PostType | null) => {
    setPage(1);
    setSelectedPostType(postType);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;

    try {
      await api.delete(`/posts/${selectedPost.id}`);
      toast.success("Post uğurla silindi");
      fetchPosts();
    } catch (error) {
      console.error("Post silinmədi:", error);
      toast.error("Postu silmək mümkün olmadı");
    } finally {
      onDeleteClose();
      setSelectedPost(null);
    }
  };

  const handleStatusChange = async (post: Post, isSelected: boolean) => {
    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id ? { ...p, published: isSelected } : p
        )
      );

      await api.patch(`/posts/${post.id}/publish`, { published: isSelected });
      toast.success("Status uğurla dəyişdirildi");
      await fetchPosts();
    } catch (error) {
      console.error("Status dəyişdirilmədi:", error);
      toast.error("Statusu dəyişmək mümkün olmadı");
      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id ? { ...p, published: !isSelected } : p
        )
      );
    }
  };

  const columns = [
    { name: "BAŞLIQ", uid: "title" },
    { name: "MƏZMUN", uid: "content" },
    { name: "TİP", uid: "postType" },
    { name: "STATUS", uid: "published" },
    { name: "TEQLƏR", uid: "tags" },
    { name: "YARADILMA TARİXİ", uid: "createdAt" },
    { name: "ƏMƏLİYYATLAR", uid: "actions" },
  ];

  /** NextUI Pagination `total` 0 olduqda xəta verir; boş siyahıda ən azı 1 səhifə */
  const totalPages = Math.max(1, Math.ceil((totalPosts || 0) / rowsPerPage));

  const renderCell = (post: Post, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{post.title.az}</p>
            <p className="text-tiny text-default-400">{post.title.en}</p>
          </div>
        );

      case "content":
        return (
          <div className="flex flex-col">
            <p className="text-small">
              {post.content.az.replace(/<[^>]*>/g, "").substring(0, 100)}...
            </p>
            <Link href={`/news/${post.slug.az}`}>
              <p className="text-primary text-tiny">Ətraflı</p>
            </Link>
          </div>
        );

      case "postType":
        return (
          <Chip
            className="capitalize"
            color={
              post.postType === PostType.BLOG
                ? "primary"
                : post.postType === PostType.NEWS
                ? "success"
                : "warning"
            }
            size="sm"
            variant="flat"
          >
            {post.postType === PostType.BLOG
              ? "Bloq"
              : post.postType === PostType.NEWS
              ? "Xəbər"
              : post.postType === PostType.EVENT
              ? "Tədbir"
              : post.postType === PostType.OFFERS
              ? "Kampaniya"
              : "Bilinmir"}
          </Chip>
        );

      case "published":
        return (
          <Switch
            isSelected={post.published}
            size="sm"
            color="success"
            onValueChange={(isSelected) => handleStatusChange(post, isSelected)}
          >
            {post.published ? "Aktiv" : "Deaktiv"}
          </Switch>
        );

      case "tags": {
        const localizedTags = getLocalizedPostTags(post.tags, "az");
        return (
          <div className="flex flex-wrap gap-1">
            {localizedTags.length > 0 ? (
              localizedTags.map((tag, index) => (
                <Chip key={index} size="sm" variant="flat">
                  {tag}
                </Chip>
              ))
            ) : (
              <span className="text-tiny text-default-400">Teq yoxdur</span>
            )}
          </div>
        );
      }

      case "createdAt":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-default-600">
              <MdCalendarMonth className="text-warning" size={16} />
              <p className="font-medium text-small text-black">
                {new Date(post.createdAt).toLocaleDateString("az-AZ")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-default-400">
              <MdAccessTime className="text-warning/60" size={14} />
              <p className="text-tiny">
                {new Date(post.createdAt).toLocaleTimeString("az-AZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );

      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Düzəliş et">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => router.push(`/dashboard/posts/edit/${post.id}`)}
              >
                <MdEdit className="text-default-400" size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="Sil" color="danger">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() => handleDelete(post)}
              >
                <MdDelete className="text-danger" size={20} />
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Postlar</h1>
            <p className="text-gray-500">Postları idarə edin</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              color="primary"
              className="bg-jsyellow text-white"
              startContent={<MdAdd size={24} />}
              onClick={() => router.push("/dashboard/posts/create")}
            >
              Yeni Post
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {filterButtons.map((filter) => {
            const isActive = selectedPostType === filter.value;

            return (
              <Button
                key={filter.value}
                variant={isActive ? "solid" : "bordered"}
                color={isActive ? "warning" : "default"}
                className={
                  isActive
                    ? "bg-jsyellow text-white border-jsyellow"
                    : "border-gray-300 text-default-700"
                }
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>

        <Table
          aria-label="Postlar cədvəli"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="warning"
                page={Math.min(page, totalPages)}
                total={totalPages}
                onChange={(p) => setPage(p)}
              />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={posts}
            loadingContent={<div>Yüklənir...</div>}
            loadingState={loading ? "loading" : "idle"}
            emptyContent={<div>Post tapılmadı</div>}
          >
            {(post) => (
              <TableRow key={post.id}>
                {columns.map((column) => (
                  <TableCell key={column.uid}>
                    {renderCell(post, column.uid)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Postu Sil</ModalHeader>
                <ModalBody>
                  <p>
                    &quot;{selectedPost?.title.az}&quot; postunu silmək
                    istədiyinizə əminsiniz?
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Ləğv et
                  </Button>
                  <Button color="danger" onPress={confirmDelete}>
                    Sil
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
}
