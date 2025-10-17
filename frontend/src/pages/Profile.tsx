import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { apiFetch, getToken, clearToken } from "@/lib/api";

const Profile = () => {
  type Address = { _id?: string; street: string; city: string; state: string; country: string; zipCode: string; isDefault?: boolean };
  const [profile, setProfile] = useState<{ name: string; email: string; phone?: string; avatar?: string; addresses?: Address[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<Address>({ street: "", city: "", state: "", country: "", zipCode: "", isDefault: false });
  const [addrSaving, setAddrSaving] = useState(false);

  // Orders intentionally removed; backend integration can be added later.

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "default";
      case "In Transit":
        return "secondary";
      default:
        return "outline";
    }
  };

  const isAuthed = !!getToken();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthed) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch("/profile");
        setProfile({ name: data.name, email: data.email, phone: data.phone || "", avatar: data.avatar || "", addresses: data.addresses || [] });
      } catch (e: any) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isAuthed]);

  const onSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone })
      });
      setProfile({ name: res.user.name, email: res.user.email, phone: res.user.phone || "", avatar: res.user.avatar || "" });
    } catch (e: any) {
      setError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    clearToken();
    window.location.href = "/";
  };

  const refreshProfile = async () => {
    const data = await apiFetch("/profile");
    setProfile(prev => prev ? { ...prev, name: data.name, email: data.email, phone: data.phone || "", avatar: data.avatar || "", addresses: data.addresses || [] } : prev);
  };

  const addOrUpdateAddress = async (address?: Address & { addressId?: string }) => {
    if (!profile) return;
    setAddrSaving(true);
    setError(null);
    try {
      const payload = address ? address : addrForm;
      await apiFetch("/profile/address", {
        method: "POST",
        body: JSON.stringify({
          street: payload.street,
          city: payload.city,
          state: payload.state,
          country: payload.country,
          zipCode: payload.zipCode,
          isDefault: !!payload.isDefault,
          addressId: (payload as any).addressId || undefined,
        }),
      });
      // reset form after add
      setAddrForm({ street: "", city: "", state: "", country: "", zipCode: "", isDefault: false });
      await refreshProfile();
    } catch (e: any) {
      setError(e?.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!profile) return;
    setAddrSaving(true);
    setError(null);
    try {
      await apiFetch(`/profile/address/${id}`, { method: "DELETE" });
      await refreshProfile();
    } catch (e: any) {
      setError(e?.message || "Failed to delete address");
    } finally {
      setAddrSaving(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!profile?.addresses) return;
    const addr = profile.addresses.find(a => a._id === id);
    if (!addr) return;
    await addOrUpdateAddress({ ...addr, isDefault: true, addressId: id });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        {!isAuthed ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>You're not signed in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Sign in to view and manage your profile, addresses, and orders.</p>
                <div className="flex gap-3">
                  <Link to="/login">
                    <Button>Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline">Create Account</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <p className="text-center text-muted-foreground">Loading profile...</p>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile?.avatar || ""} />
                  <AvatarFallback className="text-2xl">{profile?.name ? profile.name.split(" ").map(s=>s[0]).slice(0,2).join("") : "U"}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{profile?.name}</h2>
                <p className="text-muted-foreground mb-6">{profile?.email}</p>
                <Button variant="outline" className="w-full">
                  Edit Profile Picture
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={onLogout}>Logout</Button>
              </div>
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Default Address
              </h3>
              {profile?.addresses && profile.addresses.length > 0 ? (
                <>
                  {profile.addresses.filter(a=>a.isDefault).slice(0,1).map((a)=> (
                    <p key={a._id} className="text-sm text-muted-foreground">
                      {a.street}<br />
                      {a.city}, {a.state} {a.zipCode}<br />
                      {a.country}
                    </p>
                  ))}
                  {!profile.addresses.some(a=>a.isDefault) && (
                    <p className="text-sm text-muted-foreground">No default address set.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No addresses yet.</p>
              )}
            </Card>

            <Card className="p-6 mt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                •••• •••• •••• 4242
              </p>
              <Button variant="ghost" className="w-full">
                Manage Payment Methods
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile?.name || ""}
                    onChange={(e) =>
                      setProfile(prev => (prev ? { ...prev, name: e.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    onChange={(e) =>
                      setProfile(prev => (prev ? { ...prev, email: e.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) =>
                      setProfile(prev => (prev ? { ...prev, phone: e.target.value } : prev))
                    }
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </CardContent>
            </Card>

            {/* Address Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile?.addresses && profile.addresses.length > 0 ? (
                    profile.addresses.map((a) => (
                      <div key={a._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b last:border-0">
                        <div>
                          <p className="font-semibold">
                            {a.street}, {a.city}, {a.state} {a.zipCode}, {a.country}
                          </p>
                          {a.isDefault && <Badge className="mt-1">Default</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {!a.isDefault && (
                            <Button variant="outline" size="sm" onClick={() => setDefaultAddress(a._id!)}>Set Default</Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => deleteAddress(a._id!)}>Delete</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No addresses found.</p>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Add New Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Street</Label>
                      <Input id="street" value={addrForm.street} onChange={(e)=>setAddrForm(prev=>({ ...prev, street: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={addrForm.city} onChange={(e)=>setAddrForm(prev=>({ ...prev, city: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={addrForm.state} onChange={(e)=>setAddrForm(prev=>({ ...prev, state: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" value={addrForm.zipCode} onChange={(e)=>setAddrForm(prev=>({ ...prev, zipCode: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={addrForm.country} onChange={(e)=>setAddrForm(prev=>({ ...prev, country: e.target.value }))} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Button onClick={() => addOrUpdateAddress()} disabled={addrSaving}> {addrSaving ? "Saving..." : "Add Address"} </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order History removed for now */}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
