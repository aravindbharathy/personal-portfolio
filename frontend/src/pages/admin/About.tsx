import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAbout, useUpdateAbout, About as AboutType } from "@/hooks/useAbout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";

const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  profilePic: z.string().url("Invalid URL").or(z.literal("")).optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Platform is required"),
      url: z.string().url("Invalid URL"),
    })
  ).optional(),
});

type AboutFormData = z.infer<typeof aboutSchema>;

const AdminAbout = () => {
  const { data: about, isLoading } = useAbout();
  const updateAbout = useUpdateAbout();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AboutFormData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      profilePic: "",
      email: "",
      phone: "",
      location: "",
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  useEffect(() => {
    if (about) {
      reset({
        name: about.name || "",
        title: about.title || "",
        bio: about.bio || "",
        profilePic: about.profilePic || "",
        email: about.email || "",
        phone: about.phone || "",
        location: about.location || "",
        socialLinks: about.socialLinks || [],
      });
    }
  }, [about, reset]);

  const onSubmit = async (data: AboutFormData) => {
    setIsSaving(true);
    try {
      // Filter out empty optional fields
      const filteredData: Partial<AboutType> = {
        name: data.name,
        title: data.title,
        bio: data.bio,
      };

      if (data.profilePic) filteredData.profilePic = data.profilePic;
      if (data.email) filteredData.email = data.email;
      if (data.phone) filteredData.phone = data.phone;
      if (data.location) filteredData.location = data.location;
      if (data.socialLinks && data.socialLinks.length > 0) {
        filteredData.socialLinks = data.socialLinks;
      }

      await updateAbout.mutateAsync(filteredData);

      toast({
        title: "Success",
        description: "About information updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update about information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">About Page</h1>
          <p className="text-muted-foreground mt-1">
            Manage your about page information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="e.g., UX Researcher" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor
                    id="bio"
                    label="Bio"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Tell your story..."
                    required
                    error={errors.bio?.message}
                    minHeight={300}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="profilePic">Profile Picture URL</Label>
              <Input
                id="profilePic"
                type="url"
                placeholder="https://example.com/profile.jpg"
                {...register("profilePic")}
              />
              {errors.profilePic && (
                <p className="text-sm text-destructive mt-1">{errors.profilePic.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, Country" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Social Links</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ platform: "", url: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No social links added yet</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1">
                  <Label htmlFor={`socialLinks.${index}.platform`}>Platform</Label>
                  <Input
                    id={`socialLinks.${index}.platform`}
                    placeholder="LinkedIn, GitHub, Twitter, etc."
                    {...register(`socialLinks.${index}.platform`)}
                  />
                  {errors.socialLinks?.[index]?.platform && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.socialLinks[index]?.platform?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor={`socialLinks.${index}.url`}>URL</Label>
                  <Input
                    id={`socialLinks.${index}.url`}
                    type="url"
                    placeholder="https://..."
                    {...register(`socialLinks.${index}.url`)}
                  />
                  {errors.socialLinks?.[index]?.url && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.socialLinks[index]?.url?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminAbout;
