"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
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
  MdSearch,
} from "react-icons/md";
import { toast } from "sonner";
import api from "@/utils/api/axios";
import { Post, PostsResponse } from "@/types/post";
import { getLocalizedPostTags } from "@/utils/helpers/post";
import Link from "next/link";
import { PostType, Role } from "@/types/enums";
import { useSession } from "next-auth/react";

const ALL_CATEGORIES = "all";

export default function PostsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAuthor = (session?.user as { role?: string })?.role === Role.AUTHOR;
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const categoryOptions = useMemo(
    () =>
      isAuthor
        ? [{ key: ALL_CATEGORIES, label: "Bütün bloqlar" }]
        : [
            { key: ALL_CATEGORIES, label: "Bütün kateqoriyalar" },
            { key: PostType.BLOG, label: "Bloqlar" },
            { key: PostType.OFFERS, label: "Kampaniyalar" },
            { key: PostType.NEWS, label: "Xəbərlər" },
            { key: PostType.EVENT, label: "Tədbirlər" },
          ],
    [isAuthor]
  );

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, search]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(rowsPerPage),
        includeUnpublished: "true",
      });

      if (search) {
        params.set("search", search);
      }

      if (isAuthor) {
        const { data } = await api.get<PostsResponse>(
          `/posts/my?${params.toString()}`
        );
        const items = data?.items ?? [];
        const metaTotal = data?.meta?.total ?? 0;
        const lastPage = Math.max(1, Math.ceil(metaTotal / rowsPerPage) || 1);
        setPosts(items);
        setTotalPosts(metaTotal);
        if (page > lastPage) setPage(lastPage);
        return;
      }

      params.set("includeBlogs", "true");

      if (categoryFilter && categoryFilter !== ALL_CATEGORIES) {
        params.set("postType", categoryFilter);
      }

      const { data } = await api.get<PostsResponse>(`/posts?${params.toString()}`);
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
  }, [page, rowsPerPage, isAuthor, categoryFilter, search]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    fetchPosts();
  }, [sessionStatus, fetchPosts]);

  useEffect(() => {
    const last = Math.max(1, Math.ceil((totalPosts || 0) / rowsPerPage));
    if (page > last) setPage(last);
  }, [totalPosts, rowsPerPage, page]);

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    onDeleteOpen();
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

  const totalPages = Math.max(1, Math.ceil((totalPosts || 0) / rowsPerPage));

  const renderCell = (post: Post, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col">
              <p className="text-bold text-small">{post.title.az}</p>
              <p className="text-tiny text-default-400">{post.title.en}</p>
            </div>
          </motion.div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-3 mb-6"
        >
          {!isAuthor && (
            <Select
              label="Kateqoriya"
              size="sm"
              variant="bordered"
              className="md:max-w-xs"
              selectedKeys={[categoryFilter]}
              onChange={(e) =>
                setCategoryFilter(e.target.value || ALL_CATEGORIES)
              }
            >
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.key} value={opt.key}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          )}
          <Input
            size="sm"
            variant="bordered"
            placeholder="Başlığa görə axtar..."
            startContent={<MdSearch className="text-gray-400" size={18} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:max-w-sm"
          />
        </motion.div>

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
            loadingContent={<motion.div>Yüklənir...</motion.div>}
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
      </motion.div>

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
    </div>
  );
}
