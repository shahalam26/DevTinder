import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import ProfileCard from "../components/ProfileCard";

const SWIPE_THRESHOLD = 80;

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [animation, setAnimation] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef(null);

  // ✅ FETCH FEED
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const res = await api.get("/feed");
        if (isMounted) {
          const userData = Array.isArray(res.data?.data)
            ? res.data.data
            : [];
          setUsers(userData);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔥 MAIN ACTION HANDLER
  const handleAction = async (direction) => {
    if (animation) return;

    const user = users[currentIndex];
    if (!user) return;

    try {
      if (direction === "right") {
        // ✅ CONNECT
        await api.post(`/request/${user._id}`);
      }
      // ❌ left swipe → skip only
    } catch (err) {
      console.error("Action error:", err);
    }

    // 🔥 animate card
    setAnimation(direction);
    setDragX(direction === "right" ? 600 : -600);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setAnimation("");
      setDragX(0);
    }, 300);
  };

  // 👉 POINTER DOWN
  const onPointerDown = (e) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    isHorizontal.current = null;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // 👉 POINTER MOVE
  const onPointerMove = (e) => {
    if (!isDragging || animation) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (isHorizontal.current) {
      setDragX(dx);
    }
  };

  // 👉 POINTER UP
  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      handleAction("right");
    } else if (dragX < -SWIPE_THRESHOLD) {
      handleAction("left");
    } else {
      setDragX(0);
    }
  };

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const rotation = dragX * 0.08;
  const opacity = Math.max(0.5, 1 - Math.abs(dragX) / 400);

  // ✅ EMPTY STATE
  if (!currentUser) {
    return (
      <div className="page-section flex min-h-[70vh] items-center justify-center px-4">
        <div className="page-card max-w-xl p-10 text-center">
          <h2 className="page-title">No more developers nearby</h2>
          <p className="page-subtitle mt-3">
            Check back soon or update your profile to improve your matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section flex min-h-[75vh] items-center justify-center overflow-hidden px-4 py-8">
      <div className="relative w-full max-w-[380px]">

        {/* NEXT CARD */}
        {nextUser && (
          <div className="absolute inset-0 scale-95 opacity-60 pointer-events-none">
            <ProfileCard
              name={`${nextUser.firstName} ${nextUser.lastName}`}
              age={nextUser.age}
              bio={nextUser.about}
              skills={nextUser.skills}
              image={nextUser.photourl}
              onReject={() => {}}
              onConnect={() => {}}
            />
          </div>
        )}

        {/* CURRENT CARD */}
        <div
          className="relative touch-none cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: animation ? 0 : opacity,
            transition: isDragging
              ? "none"
              : "transform 0.3s ease, opacity 0.3s ease",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ProfileCard
            name={`${currentUser.firstName} ${currentUser.lastName}`}
            age={currentUser.age}
            bio={currentUser.about}
            skills={currentUser.skills}
            image={currentUser.photourl}
            onReject={() => handleAction("left")}
            onConnect={() => handleAction("right")}
          />
        </div>

      </div>
    </div>
  );
};

export default Feed;
